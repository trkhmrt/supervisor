import { PERMISSION_SEED } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types";

const SCOPE_DESCRIPTIONS = Object.fromEntries(
  PERMISSION_SEED.map((p) => [p.key, p.description])
) as Record<string, string>;

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "user":
      return "Kullanıcı";
    case "supervisor":
      return "Süpervizör";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

export function scopeDescription(key: string): string {
  return SCOPE_DESCRIPTIONS[key] ?? key;
}
