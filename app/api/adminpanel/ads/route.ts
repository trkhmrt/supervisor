export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { createAd, listAds } from "@/lib/db/ads";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import type { AdDisplayMode } from "@/lib/types";

export const GET = withAuth(async () => {
  try {
    const ads = await listAds();
    return NextResponse.json(ads);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.ads.list);

function asDisplayMode(value: unknown): AdDisplayMode {
  return value === "IMAGE_ONLY" ? "IMAGE_ONLY" : "IMAGE_WITH_TEXT";
}

export const POST = withAuth(async (req) => {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Başlık ve görsel URL zorunludur." },
        { status: 400 }
      );
    }

    const ad = await createAd({
      title,
      body: typeof body.body === "string" ? body.body : null,
      imageUrl,
      linkUrl: typeof body.linkUrl === "string" ? body.linkUrl : null,
      displayMode: asDisplayMode(body.displayMode),
      active: typeof body.active === "boolean" ? body.active : true,
      startsAt: typeof body.startsAt === "string" ? body.startsAt : null,
      endsAt: typeof body.endsAt === "string" ? body.endsAt : null,
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.ads.write);
