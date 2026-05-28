export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  createServiceGroup,
  listServiceGroupsForAdmin,
} from "@/lib/db/service-groups";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { parseOptionalNumber } from "@/lib/db/admin-parse";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { id: supervisorId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId")?.trim() || undefined;

    try {
      const groups = await listServiceGroupsForAdmin(supervisorId, serviceId);
      return NextResponse.json(groups);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisors.list
);

export const POST = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { id: supervisorId } = await ctx.params;

    try {
      const body = (await req.json()) as Record<string, unknown>;
      const serviceId = typeof body.serviceId === "string" ? body.serviceId.trim() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const capacity = parseOptionalNumber(body.capacity, 0);
      const seatLabel = typeof body.seatLabel === "string" ? body.seatLabel.trim() : undefined;
      const sortOrder = parseOptionalNumber(body.sortOrder, 0);
      const active = body.active === false ? false : true;
      const startsAt = typeof body.startsAt === "string" ? body.startsAt : null;
      const endsAt = typeof body.endsAt === "string" ? body.endsAt : null;

      if (!serviceId || !name || capacity < 1) {
        return NextResponse.json(
          { error: "serviceId, name ve capacity (en az 1) zorunludur." },
          { status: 400 }
        );
      }

      const group = await createServiceGroup({
        supervisorId,
        serviceId,
        name,
        capacity,
        seatLabel,
        sortOrder,
        active,
        startsAt,
        endsAt,
      });

      return NextResponse.json(group, { status: 201 });
    } catch (e) {
      const message = e instanceof Error ? e.message : prismaUnavailableMessage(e);
      const status = e instanceof Error && message.includes("bulunamadı") ? 400 : 503;
      return NextResponse.json({ error: message }, { status });
    }
  },
  GUARD.supervisors.update
);
