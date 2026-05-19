export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { getInviteByToken } from "@/lib/db/invites";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { token } = await ctx.params;
    const invite = await getInviteByToken(token);
    if (!invite) {
      return NextResponse.json({ error: "Davet bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({
      email: invite.email,
      status: invite.status,
      invitedAt: invite.invitedAt,
      expiresAt: invite.expiresAt,
      expired: invite.expired ?? invite.status === "expired",
    });
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
