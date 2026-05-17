import { createClient } from "@/lib/supabase/server";

/** app_metadata güncellemesinden sonra yeni access_token almak için */
export async function refreshSupabaseSession(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;

  const { error } = await supabase.auth.refreshSession();
  if (error && process.env.NODE_ENV === "development") {
    console.warn("[auth] refreshSession:", error.message);
  }
  return !error;
}
