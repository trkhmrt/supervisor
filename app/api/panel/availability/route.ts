export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  AvailabilityError,
  createAvailabilitySlot,
  listAvailabilityForSupervisor,
} from "@/lib/db/availability";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (_req, auth) => {
    try {
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const slots = await listAvailabilityForSupervisor(supervisorId);
      return NextResponse.json(slots);
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.availability
);

export const POST = withAuth(
  async (req, auth) => {
    try {
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const body = (await req.json()) as Record<string, unknown>;
      const date = typeof body.date === "string" ? body.date : "";
      const startTime = typeof body.startTime === "string" ? body.startTime : "";
      const endTime = typeof body.endTime === "string" ? body.endTime : "";
      if (!date || !startTime || !endTime) {
        return NextResponse.json({ error: "Tarih ve saat zorunlu." }, { status: 400 });
      }
      const slot = await createAvailabilitySlot(supervisorId, date, startTime, endTime);
      return NextResponse.json(slot, { status: 201 });
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      if (e instanceof AvailabilityError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.availability
);
