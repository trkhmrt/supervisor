export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import {
  ApplicationError,
  createSupervisorApplication,
} from "@/lib/db/supervisor-applications";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const application = await createSupervisorApplication({
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      email: typeof body.email === "string" ? body.email : "",
      phone: typeof body.phone === "string" ? body.phone : "",
      message: typeof body.message === "string" ? body.message : undefined,
    });
    return NextResponse.json(application, { status: 201 });
  } catch (e) {
    if (e instanceof ApplicationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
