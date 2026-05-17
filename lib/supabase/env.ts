/** Supabase public env (SUPERVISOR_* veya kısa isimler). */
export function getSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPERVISOR_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPERVISOR_SUPABASE_URL tanımlı değil.");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPERVISOR_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPERVISOR_SUPABASE_ANON_KEY tanımlı değil.");
  return key;
}

export function getSupabaseServiceRoleKey(): string | null {
  return (
    process.env.SUPERVISOR_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    null
  );
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Sunucu route'larında gerçek site kökü (Vercel proxy başlıkları dahil) */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto = (forwardedProto ?? "https").split(",")[0]?.trim() ?? "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

/**
 * E-posta / sunucu yönlendirmeleri için site kökü.
 * Production'da NEXT_PUBLIC_SITE_URL yanlışlıkla localhost ise VERCEL_URL tercih edilir.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL)
    : null;
  const vercel = process.env.VERCEL_URL
    ? stripTrailingSlash(`https://${process.env.VERCEL_URL}`)
    : null;

  if (process.env.NODE_ENV === "production") {
    if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;
    if (vercel) return vercel;
  }

  if (fromEnv) return fromEnv;
  if (vercel) return vercel;
  return "http://localhost:3000";
}
