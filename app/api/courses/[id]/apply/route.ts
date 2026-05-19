export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { applyToCourse } from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth(
  async (req, auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const body = (await req.json()) as { message?: string };
      const message = typeof body.message === "string" ? body.message : undefined;
      const result = await applyToCourse(id, auth.userId, message);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result.enrollment, { status: 201 });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.panel.courseApply
);
