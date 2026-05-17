import type { UserRole } from "@/lib/types";

export function redirectPathForRole(role: UserRole): string {
  if (role === "admin") return "/adminpanel";
  if (role === "supervisor") return "/panelim";
  return "/panelim";
}
