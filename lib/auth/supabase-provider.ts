import type { User as SupabaseUser } from "@supabase/supabase-js";

/** Supabase JWT app_metadata.provider — örn. "email", "google" */
export function supabaseAuthProvider(user: SupabaseUser): string | undefined {
  const meta = user.app_metadata as Record<string, unknown> | undefined;
  const provider = meta?.provider;
  return typeof provider === "string" ? provider : undefined;
}

/** Yalnızca OAuth (Google vb.) ile giriş — yerel şifre yok */
export function isOAuthOnlyAccount(provider: string | undefined): boolean {
  return provider != null && provider !== "email";
}
