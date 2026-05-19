export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { getSupervisorCalendarMonth } from "@/lib/db/calendar";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (req, auth) => {
    try {
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const { searchParams } = new URL(req.url);
      const now = new Date();
      const year = Number(searchParams.get("year") ?? now.getUTCFullYear());
      const month = Number(searchParams.get("month") ?? now.getUTCMonth() + 1);
      if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
        return NextResponse.json({ error: "Geçersiz ay." }, { status: 400 });
      }
      const data = await getSupervisorCalendarMonth(supervisorId, year, month);
      return NextResponse.json(data);
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.availability
);
