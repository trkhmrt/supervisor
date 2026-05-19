import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@/lib/types";

export type AdminUserRow = Pick<
  User,
  "id" | "email" | "fullName" | "role" | "emailVerified" | "createdAt" | "profession" | "experienceYears" | "license"
>;

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      profession: true,
      experienceYears: true,
      license: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.fullName,
    role: r.role as UserRole,
    emailVerified: r.emailVerified,
    createdAt: r.createdAt.toISOString(),
    profession: r.profession ?? undefined,
    experienceYears: r.experienceYears ?? undefined,
    license: r.license ?? undefined,
  }));
}

export async function setUserEmailVerified(userId: number, verified: boolean): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: verified },
  });
}
