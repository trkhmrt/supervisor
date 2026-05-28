export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { listServiceGroupsForSupervisorService } from "@/lib/db/service-groups";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id: supervisorId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get("serviceId")?.trim() ?? "";

  if (!serviceId) {
    return NextResponse.json({ error: "serviceId zorunludur." }, { status: 400 });
  }

  try {
    const groups = await listServiceGroupsForSupervisorService(supervisorId, serviceId, {
      activeOnly: true,
    });
    return NextResponse.json(groups);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
