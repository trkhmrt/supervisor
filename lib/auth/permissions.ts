import type { UserRole } from "@/lib/types";

/** resource:action format — API guard'da kontrol edilir */
export const SCOPES = {
  SUPERVISORS_LIST: "supervisors:list",
  SUPERVISORS_CREATE: "supervisors:create",
  SUPERVISORS_UPDATE: "supervisors:update",
  SUPERVISORS_DELETE: "supervisors:delete",
  SERVICES_LIST: "services:list",
  SERVICES_CREATE: "services:create",
  SERVICES_UPDATE: "services:update",
  SERVICES_DELETE: "services:delete",
  APPOINTMENTS_LIST: "appointments:list",
  APPOINTMENTS_UPDATE: "appointments:update",
  ADMINS_LIST: "admins:list",
  ADMINS_CREATE: "admins:create",
  ADMINS_UPDATE: "admins:update",
  ADMINS_DELETE: "admins:delete",
  USERS_LIST: "users:list",
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
} as const;

export type Scope = (typeof SCOPES)[keyof typeof SCOPES];

export const ALL_SCOPES: Scope[] = Object.values(SCOPES);

/** Tam yetkili admin (isSuperAdmin) için tüm scope'lar */
export const SUPER_ADMIN_SCOPES = ALL_SCOPES;

export const PERMISSION_SEED: { key: Scope; description: string }[] = [
  { key: SCOPES.SUPERVISORS_LIST, description: "Süpervizör listeleme" },
  { key: SCOPES.SUPERVISORS_CREATE, description: "Süpervizör oluşturma" },
  { key: SCOPES.SUPERVISORS_UPDATE, description: "Süpervizör güncelleme" },
  { key: SCOPES.SUPERVISORS_DELETE, description: "Süpervizör silme" },
  { key: SCOPES.SERVICES_LIST, description: "Hizmet listeleme" },
  { key: SCOPES.SERVICES_CREATE, description: "Hizmet oluşturma" },
  { key: SCOPES.SERVICES_UPDATE, description: "Hizmet güncelleme" },
  { key: SCOPES.SERVICES_DELETE, description: "Hizmet silme" },
  { key: SCOPES.APPOINTMENTS_LIST, description: "Randevu listeleme" },
  { key: SCOPES.APPOINTMENTS_UPDATE, description: "Randevu güncelleme" },
  { key: SCOPES.ADMINS_LIST, description: "Alt admin listeleme" },
  { key: SCOPES.ADMINS_CREATE, description: "Alt admin oluşturma" },
  { key: SCOPES.ADMINS_UPDATE, description: "Alt admin güncelleme" },
  { key: SCOPES.ADMINS_DELETE, description: "Alt admin silme" },
  { key: SCOPES.USERS_LIST, description: "Kullanıcı listeleme" },
  { key: SCOPES.SETTINGS_READ, description: "Ayarları görüntüleme" },
  { key: SCOPES.SETTINGS_UPDATE, description: "Ayarları güncelleme" },
];

export function hasScope(userScopes: Scope[], required: Scope | Scope[]): boolean {
  const needed = Array.isArray(required) ? required : [required];
  return needed.every((s) => userScopes.includes(s));
}

export function hasRole(role: UserRole, allowed: UserRole | UserRole[]): boolean {
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}

/** HTTP metodundan varsayılan scope (route override edebilir) */
export function scopeForMethod(
  resource: string,
  method: string
): Scope | null {
  const m = method.toUpperCase();
  if (m === "GET") return `${resource}:list` as Scope;
  if (m === "POST") return `${resource}:create` as Scope;
  if (m === "PUT" || m === "PATCH") return `${resource}:update` as Scope;
  if (m === "DELETE") return `${resource}:delete` as Scope;
  return null;
}
