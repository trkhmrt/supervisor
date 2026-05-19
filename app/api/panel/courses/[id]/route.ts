export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { deleteCourseForSupervisor, updateCourseForSupervisor } from "@/lib/db/courses";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const body = (await req.json()) as Record<string, unknown>;
      const course = await updateCourseForSupervisor(supervisorId, id, {
        title: typeof body.title === "string" ? body.title : undefined,
        description: typeof body.description === "string" ? body.description : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
        acceptsApplications:
          typeof body.acceptsApplications === "boolean" ? body.acceptsApplications : undefined,
        maxParticipants:
          body.maxParticipants === null
            ? null
            : typeof body.maxParticipants === "number"
              ? body.maxParticipants
              : undefined,
        startsAt: body.startsAt === null ? null : typeof body.startsAt === "string" ? body.startsAt : undefined,
        endsAt: body.endsAt === null ? null : typeof body.endsAt === "string" ? body.endsAt : undefined,
      });
      if (!course) {
        return NextResponse.json({ error: "Kurs bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(course);
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.courses
);

export const DELETE = withAuth(
  async (_req, auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const ok = await deleteCourseForSupervisor(supervisorId, id);
      if (!ok) {
        return NextResponse.json({ error: "Kurs bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.courses
);
