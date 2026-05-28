export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { deleteServiceGroup, updateServiceGroup } from "@/lib/db/service-groups";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { parseOptionalNumber } from "@/lib/db/admin-parse";

type Ctx = { params: Promise<{ id: string; groupId: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { groupId } = await ctx.params;

    try {
      const body = (await req.json()) as Record<string, unknown>;
      const data: Parameters<typeof updateServiceGroup>[1] = {};

      if (typeof body.name === "string") data.name = body.name;
      if (body.capacity !== undefined) data.capacity = parseOptionalNumber(body.capacity, 1);
      if (body.seatLabel !== undefined) {
        data.seatLabel = typeof body.seatLabel === "string" ? body.seatLabel : null;
      }
      if (body.sortOrder !== undefined) data.sortOrder = parseOptionalNumber(body.sortOrder, 0);
      if (typeof body.active === "boolean") data.active = body.active;
      if (body.startsAt !== undefined) {
        data.startsAt = typeof body.startsAt === "string" ? body.startsAt : null;
      }
      if (body.endsAt !== undefined) {
        data.endsAt = typeof body.endsAt === "string" ? body.endsAt : null;
      }

      const group = await updateServiceGroup(groupId, data);
      if (!group) {
        return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
      }
      return NextResponse.json(group);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisors.update
);

export const DELETE = withAuth(
  async (_req, _auth, ctx: Ctx) => {
    const { groupId } = await ctx.params;

    try {
      const ok = await deleteServiceGroup(groupId);
      if (!ok) {
        return NextResponse.json({ error: "Grup bulunamadı" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : prismaUnavailableMessage(e);
      const status = e instanceof Error && message.includes("silinemez") ? 409 : 503;
      return NextResponse.json({ error: message }, { status });
    }
  },
  GUARD.supervisors.update
);
