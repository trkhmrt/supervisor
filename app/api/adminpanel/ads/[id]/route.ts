export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { deleteAd, updateAd } from "@/lib/db/ads";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import type { AdDisplayMode } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

function asDisplayMode(value: unknown): AdDisplayMode | undefined {
  if (value === "IMAGE_ONLY") return "IMAGE_ONLY";
  if (value === "IMAGE_WITH_TEXT") return "IMAGE_WITH_TEXT";
  return undefined;
}

export const PATCH = withAuth(async (req, _auth, ctx: Params) => {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const ad = await updateAd(id, {
      title: typeof body.title === "string" ? body.title : undefined,
      body: typeof body.body === "string" ? body.body : (body.body === null ? null : undefined),
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
      linkUrl:
        typeof body.linkUrl === "string"
          ? body.linkUrl
          : body.linkUrl === null
            ? null
            : undefined,
      displayMode: asDisplayMode(body.displayMode),
      active: typeof body.active === "boolean" ? body.active : undefined,
      startsAt:
        typeof body.startsAt === "string"
          ? body.startsAt
          : body.startsAt === null
            ? null
            : undefined,
      endsAt:
        typeof body.endsAt === "string"
          ? body.endsAt
          : body.endsAt === null
            ? null
            : undefined,
    });
    return NextResponse.json(ad);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Reklam bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.ads.write);

export const DELETE = withAuth(async (_req, _auth, ctx: Params) => {
  const { id } = await ctx.params;
  try {
    await deleteAd(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Reklam bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.ads.write);
