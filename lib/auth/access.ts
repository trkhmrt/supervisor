import { SCOPES, type Scope } from "@/lib/auth/permissions";
import type { SessionUser, User } from "@/lib/types";

/** İstemci veya sunucu: kullanıcının scope'u var mı? */
export function hasUserScope(
  user: User | SessionUser | null | undefined,
  scope: Scope | string
): boolean {
  if (!user) return false;
  if (user.role === "admin" && user.isSuperAdmin) return true;
  return (user.scopes ?? []).includes(scope);
}

export function hasUserRole(
  user: User | SessionUser | null | undefined,
  role: User["role"] | User["role"][]
): boolean {
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/** Admin + süpervizör yönetimi (liste) */
export function canListSupervisors(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SUPERVISORS_LIST);
}

export function canCreateSupervisors(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SUPERVISORS_CREATE);
}

export function canDeleteSupervisors(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SUPERVISORS_DELETE);
}

export function canUpdateSupervisors(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SUPERVISORS_UPDATE);
}

export function canListServices(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SERVICES_LIST);
}

export function canCreateServices(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SERVICES_CREATE);
}

export function canDeleteServices(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SERVICES_DELETE);
}

export function canUpdateServices(user: User | SessionUser | null | undefined): boolean {
  return hasUserRole(user, "admin") && hasUserScope(user, SCOPES.SERVICES_UPDATE);
}
