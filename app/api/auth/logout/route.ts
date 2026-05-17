export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-token";

/** Supabase + admin panel oturumunu birlikte kapatır */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
