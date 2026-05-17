import { prisma } from "@/lib/prisma";
import { prismaUserToApp } from "@/lib/auth/sync-user";
import type { AuthContext } from "@/lib/auth/guard";
import type { Scope } from "@/lib/auth/permissions";
import type { AuthSource, SessionUser, UserRole } from "@/lib/types";

export async function buildSessionUser(auth: AuthContext): Promise<SessionUser | null> {
  const row = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      profession: true,
      experienceYears: true,
      title: true,
      isSuperAdmin: true,
    },
  });

  if (!row) return null;

  const base = prismaUserToApp({
    ...row,
    role: row.role as UserRole,
  });

  return {
    ...base,
    isSuperAdmin: auth.isSuperAdmin,
    scopes: auth.scopes as Scope[],
    authSource: auth.source as AuthSource,
  };
}
