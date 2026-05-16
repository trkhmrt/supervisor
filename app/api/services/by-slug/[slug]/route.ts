import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { serviceRowToApi } from "@/lib/db/service-mapper";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const row = await prisma.service.findFirst({
      where: { slug, active: true },
    });
    if (!row) {
      return NextResponse.json({ error: "Hizmet bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(serviceRowToApi(row));
  } catch (e) {
    return NextResponse.json(
      { error: prismaUnavailableMessage(e) },
      { status: 503 }
    );
  }
}
