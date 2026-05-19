import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@/lib/types";

export function prismaUserToApp(row: {
  id: number;
  supabaseAuthId?: string | null;
  email: string;
  fullName: string;
  role: UserRole;
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
    role: row.role,
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
  role: true,
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
  return prismaUserToApp({ ...row, role: row.role as UserRole });
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
  if (existing && !options.forceUpdate) {
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
    emailNorm.split("@")[0];

  const row = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseAuthId: supabaseUser.id,
          email: emailNorm,
          fullName,
          emailVerified: !!supabaseUser.email_confirmed_at,
          phone: typeof meta.phone === "string" ? meta.phone.trim() || null : undefined,
          profession: typeof meta.profession === "string" ? meta.profession : null,
          experienceYears:
            typeof meta.experience_years === "number" ? meta.experience_years : null,
        },
      })
    : await prisma.user.create({
        data: {
          supabaseAuthId: supabaseUser.id,
          email: emailNorm,
          fullName,
          role: "user",
          isSuperAdmin: false,
          emailVerified: !!supabaseUser.email_confirmed_at,
          phone: typeof meta.phone === "string" ? meta.phone.trim() || null : null,
          profession: typeof meta.profession === "string" ? meta.profession : null,
          experienceYears:
            typeof meta.experience_years === "number" ? meta.experience_years : null,
        },
      });

  if (options.syncMetadata) {
    const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
    await syncSupabaseAppMetadata(row.id);
  }

  return prismaUserToApp({ ...row, role: row.role as UserRole });
}
