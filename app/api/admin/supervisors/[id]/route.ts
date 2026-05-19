export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { getSupervisorAdminDetail } from "@/lib/db/supervisor-admin-detail";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import { parseOptionalNumber, parseStringArray } from "@/lib/db/admin-parse";

type Params = { params: Promise<{ id: string }> };

export const GET = withAuth(
  async (_req, _auth, ctx: Params) => {
    const { id } = await ctx.params;
    try {
      const detail = await getSupervisorAdminDetail(id);
      if (!detail) {
        return NextResponse.json({ error: "Süpervizör bulunamadı" }, { status: 404 });
      }
      return NextResponse.json(detail);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisors.list
);

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data: Prisma.SupervisorUpdateInput = {};

    if (typeof body.fullName === "string" && body.fullName.trim()) data.fullName = body.fullName.trim();
    if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
    if (typeof body.photo === "string" && body.photo.trim()) data.photo = body.photo.trim();
    if (typeof body.bio === "string") data.bio = body.bio.trim();
    if (typeof body.license === "string" && body.license.trim()) data.license = body.license.trim();
    if (body.pricePerSession !== undefined) {
      data.pricePerSession = parseOptionalNumber(body.pricePerSession, 0);
    }
    if (typeof body.currency === "string" && ["TRY", "USD", "EUR"].includes(body.currency)) {
      data.currency = body.currency;
    }
    if (body.expertise !== undefined) {
      const ex = parseStringArray(body.expertise);
      if (ex.length) data.expertise = { set: ex };
    }
    if (body.languages !== undefined) {
      const lang = parseStringArray(body.languages);
      if (lang.length) data.languages = { set: lang };
    }
    if (body.approaches !== undefined) {
      data.approaches = { set: parseStringArray(body.approaches) };
    }
    if (body.yearsExperience !== undefined) {
      data.yearsExperience = parseOptionalNumber(body.yearsExperience, 0);
    }
    if (body.rating !== undefined) data.rating = parseOptionalNumber(body.rating, 0);
    if (body.reviewCount !== undefined) {
      data.reviewCount = parseOptionalNumber(body.reviewCount, 0);
    }

    const row = await prisma.supervisor.update({
      where: { id },
      data,
      include: { slots: true },
    });
    return NextResponse.json(supervisorRowToApi(row));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Süpervizör bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.supervisor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Süpervizör bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
