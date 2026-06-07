import { prisma } from "@/lib/prisma";
import { ALL_SCOPES, type Scope } from "@/lib/auth/permissions";
import { roleKeyFromRow } from "@/lib/db/lookups";
import type { UserRole } from "@/lib/types";

export async function loadUserScopes(userId: number): Promise<{
  role: UserRole;
  isSuperAdmin: boolean;
  scopes: Scope[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: { select: { key: true } },
      permissions: { include: { permission: true } },
    },
  });

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const role = roleKeyFromRow(user.role);

  if (role === "admin" && user.isSuperAdmin) {
    return { role, isSuperAdmin: true, scopes: ALL_SCOPES };
  }

  const scopes = user.permissions.map((p) => p.permission.key as Scope);
  return { role, isSuperAdmin: user.isSuperAdmin, scopes };
}

export async function ensurePermissionSeeds(): Promise<void> {
  const { PERMISSION_SEED } = await import("@/lib/auth/permissions");
  for (const p of PERMISSION_SEED) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: { key: p.key, description: p.description },
      update: { description: p.description },
    });
  }
}

export async function setUserScopes(userId: number, scopeKeys: Scope[]): Promise<void> {
  await ensurePermissionSeeds();
  const perms = await prisma.permission.findMany({
    where: { key: { in: scopeKeys } },
  });

  await prisma.userPermission.deleteMany({ where: { userId } });
  if (perms.length) {
    await prisma.userPermission.createMany({
      data: perms.map((p) => ({ userId, permissionId: p.id })),
      skipDuplicates: true,
    });
  }

  const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
  await syncSupabaseAppMetadata(userId);
}
