export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";
import { loadUserScopes } from "@/lib/auth/user-scopes";
import { refreshSupabaseSession } from "@/lib/auth/refresh-supabase-session";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import type { SessionUser } from "@/lib/types";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    }

    const appUser = await syncSupabaseUser(user);
    const { scopes, isSuperAdmin } = await loadUserScopes(appUser.id);

    const sessionRefreshed = await refreshSupabaseSession();

    const sessionUser: SessionUser = {
      ...appUser,
      isSuperAdmin,
      scopes,
      authSource: "supabase",
    };

    return NextResponse.json({
      ...sessionUser,
      metadataSynced: true,
      sessionRefreshed,
    });
  } catch (e) {
    return NextResponse.json(
      { error: prismaUnavailableMessage(e) },
      { status: 503 }
    );
  }
}
