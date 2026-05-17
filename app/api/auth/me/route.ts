import { NextResponse } from "next/server";
import { authorize, guardResponse } from "@/lib/auth/guard";
import { buildSessionUser } from "@/lib/auth/session-user";
import { syncSupabaseAppMetadata } from "@/lib/auth/sync-supabase-metadata";
import { refreshSupabaseSession } from "@/lib/auth/refresh-supabase-session";

/** Site (Supabase) veya admin panel oturumu — rol + scope tek cevapta */
export async function GET() {
  const result = await authorize();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  let metadataSync: Awaited<ReturnType<typeof syncSupabaseAppMetadata>> | null = null;
  if (result.auth.source === "supabase") {
    metadataSync = await syncSupabaseAppMetadata(result.auth.userId);
    if (metadataSync.ok) {
      await refreshSupabaseSession();
    }
  }

  const sessionUser = await buildSessionUser(result.auth);
  if (!sessionUser) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ ...sessionUser, metadataSync });
}
