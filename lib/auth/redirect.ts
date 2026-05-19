import type { UserRole } from "@/lib/types";

export function redirectPathForRole(role: UserRole): string {
  return "/dashboard";
}
