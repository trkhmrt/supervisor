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

export function getSiteUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return base.replace(/\/$/, "");
}
