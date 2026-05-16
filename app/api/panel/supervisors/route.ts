import { NextResponse } from "next/server";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { createSupervisorRecord } from "@/lib/db/supervisor-create";
import { parsePanelUser } from "@/lib/panel-auth";

export async function POST(req: Request) {
  if (!parsePanelUser(req)) {
    return NextResponse.json({ error: "Panel için giriş bilgisi gerekli (x-user-id, x-user-role)." }, { status: 401 });
  }

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
