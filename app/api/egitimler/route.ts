export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { listPublicCourses } from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export async function GET() {
  try {
    return NextResponse.json(await listPublicCourses());
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
