export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { lookupPrismaUserBySupabase } from "@/lib/auth/sync-user";
import {
  ANALYTICS_SESSION_COOKIE,
  ANALYTICS_SESSION_MAX_AGE,
} from "@/lib/analytics/constants";
import { getClientIp } from "@/lib/analytics/client-ip";
import { trackPageView } from "@/lib/analytics/track-page-view";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type TrackBody = {
  path?: string;
  referrer?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
};

function newSessionId(): string {
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackBody;
    const path = body.path;
    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path gerekli" }, { status: 400 });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(ANALYTICS_SESSION_COOKIE)?.value;
    const isNewSession = !sessionId;
    if (!sessionId) {
      sessionId = newSessionId();
    }

    let userId: number | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const prismaUser = await lookupPrismaUserBySupabase(user);
        if (prismaUser) userId = prismaUser.id;
      }
    } catch {
      // Oturum yoksa anonim kayıt
    }

    const userAgent = request.headers.get("user-agent");
    const ipAddress = getClientIp(request);

    await trackPageView({
      path,
      referrer: body.referrer ?? null,
      ipAddress,
      userAgent,
      screenWidth: body.screenWidth ?? null,
      screenHeight: body.screenHeight ?? null,
      sessionId,
      userId,
    });

    const res = NextResponse.json({ ok: true });
    if (isNewSession) {
      res.cookies.set(ANALYTICS_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ANALYTICS_SESSION_MAX_AGE,
      });
    }
    return res;
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
