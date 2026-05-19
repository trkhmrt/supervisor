export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { listPublicCoursesForSupervisor } from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const courses = await listPublicCoursesForSupervisor(id);
    return NextResponse.json(courses);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
