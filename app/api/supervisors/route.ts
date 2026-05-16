import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";

export async function GET() {
  try {
    const rows = await prisma.supervisor.findMany({
      include: { slots: true },
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json(rows.map(supervisorRowToApi));
  } catch (e) {
    return NextResponse.json(
      { error: prismaUnavailableMessage(e) },
      { status: 503 }
    );
  }
}
