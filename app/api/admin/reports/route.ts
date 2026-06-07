export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { getAdminReport } from "@/lib/db/reports";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const from = searchParams.get("from") ?? undefined;
      const to = searchParams.get("to") ?? undefined;
      const supervisorId = searchParams.get("supervisorId") ?? undefined;

      return NextResponse.json(await getAdminReport({ from, to, supervisorId }));
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.appointments.list
);
