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

export const GET = withAuth(
  async () => {
    try {
      const rows = await prisma.service.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(rows.map(serviceRowToApi));
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.services.list
);

export const POST = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const name = typeof body.name === "string" ? body.name.trim() : "";
      let slug =
        typeof body.slug === "string" && body.slug.trim()
          ? slugify(body.slug.trim())
          : slugify(name);
      const shortDescription =
        typeof body.shortDescription === "string" ? body.shortDescription.trim() : "";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const features = parseStringArray(body.features);
      const iconRaw = typeof body.icon === "string" ? body.icon.trim().toLowerCase() : "user";
      const icon = ICONS.has(iconRaw) ? iconRaw : "user";
      const price = parseOptionalNumber(body.price, 0);
      const duration = parseOptionalNumber(body.duration, 50);
      const active = body.active === false ? false : true;
      const isGroupService = body.isGroupService === true;

      if (!name || !slug || !shortDescription || !description) {
        return NextResponse.json(
          { error: "name, slug (veya name), shortDescription ve description zorunludur." },
          { status: 400 }
        );
      }
      if (!features.length) {
        return NextResponse.json({ error: "En az bir özellik (features) girin." }, { status: 400 });
      }

      const row = await prisma.service.create({
        data: {
          slug,
          name,
          shortDescription,
          description,
          features,
          icon,
          price,
          duration,
          active,
          isGroupService,
        },
      });
      return NextResponse.json(serviceRowToApi(row), { status: 201 });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ error: "Bu slug zaten kullanılıyor." }, { status: 409 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.services.create
);
