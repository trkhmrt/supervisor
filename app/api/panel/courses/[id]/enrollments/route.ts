export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listEnrollmentsForCourse } from "@/lib/db/courses";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(
  async (_req, auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const enrollments = await listEnrollmentsForCourse(supervisorId, id);
      if (enrollments === null) {
        return NextResponse.json({ error: "Kurs bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(enrollments);
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.courses
);
