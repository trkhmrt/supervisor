import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Service role — yalnızca sunucuda; app_metadata güncellemesi için */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const key = getSupabaseServiceRoleKey();
  if (!key) return null;

  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
