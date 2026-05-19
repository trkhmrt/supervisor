export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { deleteInvite } from "@/lib/db/invites";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withAuth(
  async (_req, _auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const ok = await deleteInvite(id);
      if (!ok) {
        return NextResponse.json({ error: "Davet bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.invites.delete
);
