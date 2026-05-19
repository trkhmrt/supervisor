export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  APPOINTMENT_LIST_MAX_LIMIT,
  listAppointmentsForAuth,
} from "@/lib/db/appointments";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (req, auth) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = Number.parseInt(searchParams.get("limit") ?? "", 10);
      const offset = Number.parseInt(searchParams.get("offset") ?? "", 10);

      const result = await listAppointmentsForAuth(auth, {
        limit: Number.isFinite(limit) ? Math.min(limit, APPOINTMENT_LIST_MAX_LIMIT) : undefined,
        offset: Number.isFinite(offset) ? offset : undefined,
      });
      const res = NextResponse.json(result);
      res.headers.set("Cache-Control", "no-store, must-revalidate");
      return res;
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.panel.appointmentsList
);
