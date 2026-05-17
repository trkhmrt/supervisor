import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";
import { refreshSupabaseSession } from "@/lib/auth/refresh-supabase-session";
import { redirectPathForRole } from "@/lib/auth/redirect";
import { getRequestOrigin } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  /** OAuth dönüşünde mevcut host (prod domain); env'deki localhost kullanılmaz */
  const origin = getRequestOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const appUser = await syncSupabaseUser(user);
        await refreshSupabaseSession();
        const target =
          nextParam && nextParam.startsWith("/")
            ? nextParam
            : redirectPathForRole(appUser.role);
        return NextResponse.redirect(`${origin}${target}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/giris?error=auth_callback`);
}
