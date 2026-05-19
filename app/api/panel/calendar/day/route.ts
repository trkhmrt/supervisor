export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { AvailabilityError } from "@/lib/db/availability";
import { setSupervisorDayAvailability, setSupervisorSlotEnabled } from "@/lib/db/calendar";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const PATCH = withAuth(
  async (req, auth) => {
    try {
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const body = (await req.json()) as Record<string, unknown>;
      const date = typeof body.date === "string" ? body.date : "";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
      }

      if (typeof body.available === "boolean") {
        const day = await setSupervisorDayAvailability(supervisorId, date, body.available);
        return NextResponse.json(day);
      }

      const startTime = typeof body.startTime === "string" ? body.startTime : "";
      const enabled = body.enabled;
      if (startTime && typeof enabled === "boolean") {
        const day = await setSupervisorSlotEnabled(supervisorId, date, startTime, enabled);
        return NextResponse.json(day);
      }

      return NextResponse.json({ error: "available veya startTime+enabled gerekli." }, { status: 400 });
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
