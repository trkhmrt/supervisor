import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import { createSupervisorRecord } from "@/lib/db/supervisor-create";

export async function GET() {
  try {
    const rows = await prisma.supervisor.findMany({
      include: { slots: true },
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json(rows.map(supervisorRowToApi));
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}

export async function POST(req: Request) {
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
}
