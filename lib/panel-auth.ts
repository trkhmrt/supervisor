import type { UserRole } from "@/lib/types";

const ALLOWED: UserRole[] = ["user", "supervisor", "admin"];

/** @deprecated Gerçek oturum için `withAuth` / cookie kullanın. */
export function parsePanelUser(req: Request): { userId: number; role: UserRole } | null {
  const raw = req.headers.get("x-user-id")?.trim();
  const role = req.headers.get("x-user-role")?.trim() as UserRole | undefined;
  if (!raw || !role || !ALLOWED.includes(role)) return null;
  const userId = Number.parseInt(raw, 10);
  if (!Number.isFinite(userId) || userId <= 0) return null;
  return { userId, role };
}
