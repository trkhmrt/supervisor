export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listAllAppointmentsForAdmin } from "@/lib/db/appointments";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = Number.parseInt(searchParams.get("limit") ?? "50", 10);
      const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
      const data = await listAllAppointmentsForAdmin({ limit, offset });
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.appointments.list
);
