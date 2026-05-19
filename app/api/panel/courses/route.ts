export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { createCourseForSupervisor, listCoursesForSupervisor } from "@/lib/db/courses";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (_req, auth) => {
    try {
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const courses = await listCoursesForSupervisor(supervisorId);
      const res = NextResponse.json(courses);
      res.headers.set("Cache-Control", "no-store");
      return res;
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.courses
);

export const POST = withAuth(
  async (req, auth) => {
    try {
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const body = (await req.json()) as Record<string, unknown>;
      const course = await createCourseForSupervisor(supervisorId, {
        title: typeof body.title === "string" ? body.title : "",
        slug: typeof body.slug === "string" ? body.slug : undefined,
        description: typeof body.description === "string" ? body.description : "",
        active: typeof body.active === "boolean" ? body.active : true,
        acceptsApplications:
          typeof body.acceptsApplications === "boolean" ? body.acceptsApplications : true,
        maxParticipants:
          typeof body.maxParticipants === "number" ? body.maxParticipants : null,
        startsAt: typeof body.startsAt === "string" ? body.startsAt : null,
        endsAt: typeof body.endsAt === "string" ? body.endsAt : null,
      });
      return NextResponse.json(course, { status: 201 });
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.courses
);
