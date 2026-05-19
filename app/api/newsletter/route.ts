export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/db/newsletter";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Geçerli e-posta girin." }, { status: 400 });
    }
    const result = await subscribeNewsletter(email);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
