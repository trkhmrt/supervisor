import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { roleConnect, roleKeyFromRow } from "@/lib/db/lookups";
import type { User, UserRole } from "@/lib/types";

export function prismaUserToApp(row: {
  id: number;
  supabaseAuthId?: string | null;
  email: string;
  fullName: string;
  role: UserRole | { key: string };
  emailVerified: boolean;
  createdAt: Date;
  phone: string | null;
  profession: string | null;
  experienceYears: number | null;
  title: string | null;
  isSuperAdmin?: boolean;
}): User {
  return {
    id: row.id,
    supabaseAuthId: row.supabaseAuthId,
    email: row.email,
    fullName: row.fullName,
    role: roleKeyFromRow(row.role),
    emailVerified: row.emailVerified,
    createdAt: row.createdAt.toISOString(),
    phone: row.phone ?? undefined,
    profession: row.profession ?? undefined,
    experienceYears: row.experienceYears ?? undefined,
    title: row.title ?? undefined,
    isSuperAdmin: row.isSuperAdmin,
  };
}

const USER_LOOKUP_SELECT = {
  id: true,
  supabaseAuthId: true,
  email: true,
  fullName: true,
  role: { select: { key: true } },
  emailVerified: true,
  createdAt: true,
  phone: true,
  profession: true,
  experienceYears: true,
  title: true,
  isSuperAdmin: true,
} as const;

/** Okuma yolu — yazma / Supabase metadata yok (panel API için hızlı). */
export async function lookupPrismaUserBySupabase(
  supabaseUser: SupabaseUser
): Promise<User | null> {
  const email = supabaseUser.email?.toLowerCase();
  if (!email) return null;

  const row = await prisma.user.findFirst({
    where: {
      OR: [{ supabaseAuthId: supabaseUser.id }, { email }],
    },
    select: USER_LOOKUP_SELECT,
  });

  if (!row) return null;
  return prismaUserToApp(row);
}

export type SyncSupabaseUserOptions = {
  /** Mevcut kaydı Supabase ile güncelle (giriş /api/auth/sync) */
  forceUpdate?: boolean;
  /** app_metadata senkronu (yalnızca oluşturma veya forceUpdate) */
  syncMetadata?: boolean;
};

/** Supabase Auth → Prisma. Varsayılan: mevcut kullanıcıda yazma yapmaz. */
export async function syncSupabaseUser(
  supabaseUser: SupabaseUser,
  options: SyncSupabaseUserOptions = {}
): Promise<User> {
  const email = supabaseUser.email;
  if (!email) {
    throw new Error("Supabase kullanıcısında e-posta yok.");
  }

  const existing = await lookupPrismaUserBySupabase(supabaseUser);
  const linkedToThisAuth =
    existing?.supabaseAuthId != null && existing.supabaseAuthId === supabaseUser.id;

  if (existing && !options.forceUpdate && linkedToThisAuth) {
    return existing;
  }

  const emailNorm = email.toLowerCase();
  const meta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const firstName = typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const lastName = typeof meta.last_name === "string" ? meta.last_name.trim() : "";
  const fullName =
    (firstName && lastName ? `${firstName} ${lastName}` : "") ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    existing?.fullName ||
    emailNorm.split("@")[0];

  const row = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseAuthId: supabaseUser.id,
          email: emailNorm,
          fullName,
          emailVerified: !!supabaseUser.email_confirmed_at || existing.emailVerified,
          phone: typeof meta.phone === "string" ? meta.phone.trim() || null : undefined,
          profession: typeof meta.profession === "string" ? meta.profession : null,
          experienceYears:
            typeof meta.experience_years === "number" ? meta.experience_years : null,
        },
        include: { role: { select: { key: true } } },
      })
    : await prisma.user.create({
        data: {
          supabaseAuthId: supabaseUser.id,
          email: emailNorm,
          fullName,
          role: roleConnect("user"),
          isSuperAdmin: false,
          emailVerified: !!supabaseUser.email_confirmed_at,
          phone: typeof meta.phone === "string" ? meta.phone.trim() || null : null,
          profession: typeof meta.profession === "string" ? meta.profession : null,
          experienceYears:
            typeof meta.experience_years === "number" ? meta.experience_years : null,
        },
        include: { role: { select: { key: true } } },
      });

  if (options.syncMetadata) {
    const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
    await syncSupabaseAppMetadata(row.id);
  }

  return prismaUserToApp(row);
}

/**
 * Google OAuth dönüşü: e-posta veya supabaseAuthId ile Prisma'da ara;
 * yoksa yeni üye (role: user) oluştur, varsa Google hesabını bağla ve girişe izin ver.
 */
export async function resolveOAuthAppUser(supabaseUser: SupabaseUser): Promise<User> {
  return syncSupabaseUser(supabaseUser, {
    forceUpdate: true,
    syncMetadata: true,
  });
}
