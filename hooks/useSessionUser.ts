import { useCurrentUser } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

/** Giriş yapmış kullanıcı — rol, scope ve authSource dahil */
export function useSessionUser(): SessionUser | null {
  return useCurrentUser() as SessionUser | null;
}
