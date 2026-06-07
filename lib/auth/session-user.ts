import { prisma } from "@/lib/prisma";
import { prismaUserToApp } from "@/lib/auth/sync-user";
import type { AuthContext } from "@/lib/auth/guard";
import type { Scope } from "@/lib/auth/permissions";
import type { AuthSource, SessionUser } from "@/lib/types";

export async function buildSessionUser(auth: AuthContext): Promise<SessionUser | null> {
  const row = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
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
    },
  });

  if (!row) return null;

  const base = prismaUserToApp(row);

  return {
    ...base,
    isSuperAdmin: auth.isSuperAdmin,
    scopes: auth.scopes as Scope[],
    authSource: auth.source as AuthSource,
    authProvider: auth.authProvider,
  };
}
