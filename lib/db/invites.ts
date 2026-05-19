import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/auth/generate-password";
import { inviteExpiresAt } from "@/lib/db/supervisor-applications";
import {
  sendEmail,
  supervisorCredentialsEmailHtml,
  supervisorInviteLinkEmailHtml,
} from "@/lib/email/send";
import { getSiteUrl } from "@/lib/supabase/env";
import type { SupervisorInvite } from "@/lib/types";

const EXPIRED_MESSAGE =
  "Süresi dolmuş kayıt formu. Kaydınız yapılamadı. Lütfen yeni davet talep edin.";

function inviteRowToApi(
  row: {
    id: string;
    token: string;
    email: string;
    invitedAt: Date;
    expiresAt: Date | null;
    acceptedAt: Date | null;
    status: "pending" | "accepted" | "expired";
    applicationId: string | null;
  },
  opts?: { expired?: boolean }
): SupervisorInvite {
  return {
    id: row.id,
    token: row.token,
    email: row.email,
    invitedAt: row.invitedAt.toISOString(),
    expiresAt: effectiveExpiresAt(row).toISOString(),
    acceptedAt: row.acceptedAt?.toISOString(),
    status: row.status,
    applicationId: row.applicationId,
    expired: opts?.expired,
  };
}

function effectiveExpiresAt(row: { invitedAt: Date; expiresAt: Date | null }): Date {
  return row.expiresAt ?? inviteExpiresAt(row.invitedAt);
}

async function markExpiredIfNeeded(row: {
  id: string;
  status: string;
  invitedAt: Date;
  expiresAt: Date | null;
}): Promise<boolean> {
  if (row.status !== "pending") return row.status === "expired";
  if (effectiveExpiresAt(row) >= new Date()) return false;
  await prisma.supervisorInvite.update({
    where: { id: row.id },
    data: { status: "expired" },
  });
  return true;
}

export async function listInvites(): Promise<SupervisorInvite[]> {
  const rows = await prisma.supervisorInvite.findMany({
    orderBy: { invitedAt: "desc" },
  });
  const out: SupervisorInvite[] = [];
  for (const row of rows) {
    const expired = await markExpiredIfNeeded(row);
    out.push(
      inviteRowToApi(
        { ...row, status: expired ? "expired" : row.status },
        { expired }
      )
    );
  }
  return out;
}

export async function createInvite(
  email: string,
  options?: { applicationId?: string; sendEmail?: boolean }
): Promise<SupervisorInvite & { inviteUrl: string }> {
  const normalized = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalized } });
  if (existingUser?.role === "supervisor") {
    throw new InviteError("Bu e-posta zaten süpervizör hesabına bağlı.");
  }

  const now = new Date();
  const expiresAt = inviteExpiresAt(now);
  const token = randomUUID();

  const existingPending = await prisma.supervisorInvite.findFirst({
    where: { email: normalized, status: "pending", expiresAt: { gt: now } },
  });
  if (existingPending) {
    const site = getSiteUrl();
    return {
      ...inviteRowToApi(existingPending),
      inviteUrl: `${site}/davet/${existingPending.token}`,
    };
  }

  const row = await prisma.supervisorInvite.create({
    data: {
      email: normalized,
      token,
      invitedAt: now,
      expiresAt,
      status: "pending",
      applicationId: options?.applicationId ?? null,
    },
  });

  if (options?.applicationId) {
    await prisma.supervisorApplication.update({
      where: { id: options.applicationId },
      data: { status: "invited" },
    });
  }

  const site = getSiteUrl();
  const inviteUrl = `${site}/davet/${row.token}`;

  if (options?.sendEmail !== false) {
    await sendEmail({
      to: normalized,
      subject: "Süpervizör kayıt formunuz",
      html: supervisorInviteLinkEmailHtml({
        inviteUrl,
        expiresAt: expiresAt.toLocaleDateString("tr-TR"),
      }),
    });
  }

  return { ...inviteRowToApi(row), inviteUrl };
}

export async function deleteInvite(id: string): Promise<boolean> {
  const result = await prisma.supervisorInvite.deleteMany({ where: { id } });
  return result.count > 0;
}

export async function getInviteByToken(token: string): Promise<SupervisorInvite | null> {
  const row = await prisma.supervisorInvite.findUnique({ where: { token } });
  if (!row) return null;

  const expired = await markExpiredIfNeeded(row);
  if (expired) {
    return inviteRowToApi({ ...row, status: "expired" }, { expired: true });
  }

  return inviteRowToApi(row);
}

export class InviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InviteError";
  }
}

export type RegisterInviteInput = {
  fullName: string;
  title: string;
  bio: string;
  license: string;
  expertise: string[];
  pricePerSession: number;
  yearsExperience?: number;
  photo?: string;
};

/** Davet formu — hesap oluşturur, süpervizör profili açar, giriş bilgilerini e-postalar */
export async function registerInvite(
  token: string,
  input: RegisterInviteInput
): Promise<{ ok: true; email: string }> {
  const invite = await prisma.supervisorInvite.findUnique({ where: { token } });
  if (!invite) {
    throw new InviteError("Kayıt formu bulunamadı.");
  }

  if (invite.status === "accepted") {
    throw new InviteError("Bu kayıt formu zaten kullanıldı.");
  }

  const expired = await markExpiredIfNeeded(invite);
  if (expired || invite.status === "expired") {
    throw new InviteError(EXPIRED_MESSAGE);
  }

  if (invite.status !== "pending") {
    throw new InviteError("Kayıt formu geçersiz.");
  }

  const email = invite.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new InviteError("Bu e-posta ile zaten bir hesap var. Giriş yapın.");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new InviteError(
      "Kayıt sunucusu yapılandırılmamış. SUPERVISOR_SUPABASE_SERVICE_ROLE_KEY gerekli."
    );
  }

  const password = generateTemporaryPassword();
  const fullName = input.fullName.trim();

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "supervisor",
    },
  });

  if (authError || !authData.user) {
    throw new InviteError(authError?.message ?? "Hesap oluşturulamadı.");
  }

  const { userRow, sup } = await prisma.$transaction(async (tx) => {
    const userRow = await tx.user.create({
      data: {
        supabaseAuthId: authData.user!.id,
        email,
        fullName,
        role: "supervisor",
        title: input.title.trim(),
        license: input.license.trim(),
        emailVerified: true,
        isSuperAdmin: false,
      },
    });

    const sup = await tx.supervisor.create({
      data: {
        userId: userRow.id,
        fullName,
        title: input.title.trim(),
        photo: input.photo?.trim() || `https://i.pravatar.cc/300?u=${userRow.id}`,
        bio: input.bio.trim(),
        license: input.license.trim(),
        pricePerSession: input.pricePerSession,
        expertise: input.expertise.length ? input.expertise : ["Genel"],
        languages: ["Türkçe"],
        approaches: [],
        yearsExperience: input.yearsExperience ?? 0,
      },
    });

    await tx.supervisorInvite.update({
      where: { id: invite.id },
      data: { status: "accepted", acceptedAt: new Date() },
    });

    return { userRow, sup };
  });

  const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
  await syncSupabaseAppMetadata(userRow.id);

  const { ensureDefaultAvailabilitySlots } = await import("@/lib/db/availability");
  await ensureDefaultAvailabilitySlots(sup.id);

  const site = getSiteUrl();
  await sendEmail({
    to: email,
    subject: "Süpervizör hesabınız oluşturuldu",
    html: supervisorCredentialsEmailHtml({
      fullName,
      email,
      password,
      loginUrl: `${site}/giris`,
    }),
  });

  return { ok: true, email };
}
