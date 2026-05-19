export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { createInvite, InviteError, listInvites } from "@/lib/db/invites";
import { getSiteUrl } from "@/lib/supabase/env";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async () => {
    try {
      return NextResponse.json(await listInvites());
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.invites.list
);

export const POST = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as { email?: string };
      const email = typeof body.email === "string" ? body.email : "";
      if (!email.includes("@")) {
        return NextResponse.json({ error: "Geçerli e-posta girin." }, { status: 400 });
      }
      const invite = await createInvite(email);
      const site = getSiteUrl();
      return NextResponse.json(
        {
          ...invite,
          inviteUrl: `${site}/davet/${invite.token}`,
        },
        { status: 201 }
      );
    } catch (e) {
      if (e instanceof InviteError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.invites.create
);
