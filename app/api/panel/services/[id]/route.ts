export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { serviceRowToApi } from "@/lib/db/service-mapper";
import { parseOptionalNumber, parseStringArray } from "@/lib/db/admin-parse";
import { slugify } from "@/lib/utils";

const ICONS = new Set(["user", "users", "handshake", "stage"]);

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { id } = await ctx.params;
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const data: Prisma.ServiceUpdateInput = {};

      if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
      if (typeof body.slug === "string" && body.slug.trim()) data.slug = slugify(body.slug.trim());
      if (typeof body.shortDescription === "string") {
        data.shortDescription = body.shortDescription.trim();
      }
      if (typeof body.description === "string") data.description = body.description.trim();
      if (body.features !== undefined) {
        const f = parseStringArray(body.features);
        if (f.length) data.features = { set: f };
      }
      if (typeof body.icon === "string" && body.icon.trim()) {
        const icon = body.icon.trim().toLowerCase();
        if (ICONS.has(icon)) data.icon = icon;
      }
      if (body.price !== undefined) data.price = parseOptionalNumber(body.price, 0);
      if (body.duration !== undefined) data.duration = parseOptionalNumber(body.duration, 50);
      if (typeof body.active === "boolean") data.active = body.active;

      const row = await prisma.service.update({ where: { id }, data });
      return NextResponse.json(serviceRowToApi(row));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return NextResponse.json({ error: "Hizmet bulunamadı" }, { status: 404 });
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.services.update
);

export const DELETE = withAuth(
  async (_req, _auth, ctx: Ctx) => {
    const { id } = await ctx.params;
    try {
      await prisma.service.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        return NextResponse.json({ error: "Hizmet bulunamadı" }, { status: 404 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.services.delete
);
