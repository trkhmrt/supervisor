export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import { createSupervisorRecord } from "@/lib/db/supervisor-create";

export const GET = withAuth(
  async () => {
    try {
      const rows = await prisma.supervisor.findMany({
        include: { slots: true },
        orderBy: { fullName: "asc" },
      });
      return NextResponse.json(rows.map(supervisorRowToApi));
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisors.list
);

export const POST = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const result = await createSupervisorRecord(body);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result.supervisor, { status: 201 });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisors.create
);
