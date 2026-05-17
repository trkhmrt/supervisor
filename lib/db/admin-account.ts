import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { ensurePermissionSeeds, setUserScopes, loadUserScopes } from "@/lib/auth/user-scopes";
import { createSupervisorRecord } from "@/lib/db/supervisor-create";
import type { Scope } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types";
import { signAdminToken } from "@/lib/auth/admin-token";

export async function authenticateAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.role !== "admin" || !user.password) {
    return { ok: false as const, error: "E-posta veya şifre hatalı." };
  }

  const { verifyPassword } = await import("@/lib/auth/password");
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { ok: false as const, error: "E-posta veya şifre hatalı." };
  }

  const { scopes, isSuperAdmin } = await loadUserScopes(user.id);
  const token = await signAdminToken({
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
    isSuperAdmin,
    scopes,
  });

  return {
    ok: true as const,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as UserRole,
      isSuperAdmin,
      scopes,
    },
  };
}

export async function createAdminAccount(data: {
  email: string;
  password: string;
  fullName: string;
  isSuperAdmin?: boolean;
  scopes?: Scope[];
}) {
  await ensurePermissionSeeds();
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: passwordHash,
      fullName: data.fullName,
      role: "admin",
      isSuperAdmin: data.isSuperAdmin ?? false,
      emailVerified: true,
    },
  });

  if (!data.isSuperAdmin && data.scopes?.length) {
    await setUserScopes(user.id, data.scopes);
  } else {
    const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
    await syncSupabaseAppMetadata(user.id);
  }

  return user;
}

export async function createSupervisorWithUser(
  supervisorBody: Record<string, unknown>,
  account: { email: string; password: string; fullName?: string }
) {
  const supResult = await createSupervisorRecord(supervisorBody);
  if (!supResult.ok) return supResult;

  const passwordHash = await hashPassword(account.password);
  const fullName =
    (typeof account.fullName === "string" && account.fullName) ||
    supResult.supervisor.fullName;

  const user = await prisma.user.create({
    data: {
      email: account.email.toLowerCase(),
      password: passwordHash,
      fullName,
      role: "supervisor",
      isSuperAdmin: false,
      emailVerified: true,
      license: supResult.supervisor.license,
    },
  });

  await prisma.supervisor.update({
    where: { id: supResult.supervisor.id },
    data: { userId: user.id },
  });

  const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
  await syncSupabaseAppMetadata(user.id);

  return { ok: true as const, supervisor: supResult.supervisor, userId: user.id };
}
