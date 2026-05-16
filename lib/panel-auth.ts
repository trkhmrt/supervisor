import type { UserRole } from "@/lib/types";

const ALLOWED: UserRole[] = ["supervisee", "supervisor", "admin"];

/** İstemci panel oturumu (Zustand); gerçek oturum için ileride cookie/JWT ile değiştirin. */
export function parsePanelUser(req: Request): { userId: string; role: UserRole } | null {
  const userId = req.headers.get("x-user-id")?.trim();
  const role = req.headers.get("x-user-role")?.trim() as UserRole | undefined;
  if (!userId || !role || !ALLOWED.includes(role)) return null;
  return { userId, role };
}
