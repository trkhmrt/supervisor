import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@/lib/types";

export function prismaUserToApp(row: {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  profession: string | null;
  experienceYears: number | null;
  title: string | null;
  isSuperAdmin?: boolean;
}): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt.toISOString(),
    profession: row.profession ?? undefined,
    experienceYears: row.experienceYears ?? undefined,
    title: row.title ?? undefined,
    isSuperAdmin: row.isSuperAdmin,
  };
}

/** Supabase Auth (Google / site kayıt) → Prisma. Yeni kayıtlar varsayılan `user` rolü alır. */
export async function syncSupabaseUser(supabaseUser: SupabaseUser): Promise<User> {
  const email = supabaseUser.email;
  if (!email) {
    throw new Error("Supabase kullanıcısında e-posta yok.");
  }

  const meta = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    email.split("@")[0];

  const existing = await prisma.user.findUnique({ where: { id: supabaseUser.id } });

  const row = await prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email: email.toLowerCase(),
      fullName,
      role: "user",
      isSuperAdmin: false,
      emailVerified: !!supabaseUser.email_confirmed_at,
      profession: typeof meta.profession === "string" ? meta.profession : null,
      experienceYears:
        typeof meta.experience_years === "number" ? meta.experience_years : null,
    },
    update: {
      email: email.toLowerCase(),
      fullName,
      emailVerified: !!supabaseUser.email_confirmed_at,
      profession: typeof meta.profession === "string" ? meta.profession : null,
      experienceYears:
        typeof meta.experience_years === "number" ? meta.experience_years : null,
      // Mevcut kullanıcıda rolü koru (admin/supervisor elle atanır)
      ...(existing ? {} : { role: "user" }),
    },
  });

  const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
  await syncSupabaseAppMetadata(row.id);

  return prismaUserToApp({ ...row, role: row.role as UserRole });
}
