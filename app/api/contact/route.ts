export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/db/contact";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!name || !email.includes("@") || !message) {
      return NextResponse.json({ error: "Ad, e-posta ve mesaj zorunlu." }, { status: 400 });
    }
    const row = await createContactMessage({ name, email, subject: subject || "İletişim", message });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
