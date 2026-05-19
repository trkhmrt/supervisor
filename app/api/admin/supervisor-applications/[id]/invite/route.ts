export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { createInvite, InviteError } from "@/lib/db/invites";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth(
  async (_req, _auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const application = await prisma.supervisorApplication.findUnique({
        where: { id },
      });
      if (!application) {
        return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
      }
      if (application.status === "invited") {
        return NextResponse.json({ error: "Bu talep için zaten davet gönderildi." }, { status: 400 });
      }

      const invite = await createInvite(application.email, {
        applicationId: application.id,
        sendEmail: true,
      });

      return NextResponse.json(invite, { status: 201 });
    } catch (e) {
      if (e instanceof InviteError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.applications.invite
);
