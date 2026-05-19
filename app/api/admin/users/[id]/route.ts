export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { setUserEmailVerified } from "@/lib/db/users-admin";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const userId = Number.parseInt(id, 10);
      if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Geçersiz kullanıcı." }, { status: 400 });
      }
      const body = (await req.json()) as { emailVerified?: boolean };
      if (typeof body.emailVerified !== "boolean") {
        return NextResponse.json({ error: "emailVerified gerekli." }, { status: 400 });
      }
      await setUserEmailVerified(userId, body.emailVerified);
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.users.update
);
