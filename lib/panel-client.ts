import type { User } from "@/lib/types";

/** Panel API — oturum çerezleri ile; rol/scope sunucuda withAuth ile doğrulanır */
export function panelFetch(_user: User, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

/** API hata mesajı (403 yetki dahil) */
export async function panelErrorMessage(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 403) return j.error ?? "Bu işlem için yetkiniz yok.";
  return j.error ?? fallback;
}
