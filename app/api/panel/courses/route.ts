export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listCoursesForSupervisor } from "@/lib/db/courses";
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
  async () =>
    NextResponse.json({ error: "Kurs oluşturma yalnızca admin panelinden yapılır." }, { status: 403 }),
  GUARD.supervisor.courses
);
