export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const row = await prisma.supervisor.findUnique({
      where: { id },
      include: { slots: true },
    });
    if (!row) {
      return NextResponse.json({ error: "Süpervizör bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(supervisorRowToApi(row));
  } catch (e) {
    return NextResponse.json(
      { error: prismaUnavailableMessage(e) },
      { status: 503 }
    );
  }
}
