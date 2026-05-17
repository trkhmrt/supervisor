export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { serviceRowToApi } from "@/lib/db/service-mapper";

export async function GET() {
  try {
    const rows = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(rows.map(serviceRowToApi));
  } catch (e) {
    return NextResponse.json(
      { error: prismaUnavailableMessage(e) },
      { status: 503 }
    );
  }
}
