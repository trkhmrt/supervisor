export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listContactMessages, markContactMessageRead } from "@/lib/db/contact";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async () => {
    try {
      return NextResponse.json(await listContactMessages());
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.content.messages
);

export const PATCH = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as { id?: string; read?: boolean };
      if (!body.id || typeof body.read !== "boolean") {
        return NextResponse.json({ error: "id ve read gerekli." }, { status: 400 });
      }
      await markContactMessageRead(body.id, body.read);
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.content.messages
);
