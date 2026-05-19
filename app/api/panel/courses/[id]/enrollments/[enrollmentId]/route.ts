export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import type { CourseEnrollmentStatus } from "@prisma/client";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { updateEnrollmentStatus } from "@/lib/db/courses";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string; enrollmentId: string }> };

const ALLOWED: CourseEnrollmentStatus[] = ["pending", "approved", "rejected", "cancelled"];

export const PATCH = withAuth(
  async (req, auth, ctx: Ctx) => {
    try {
      const { id, enrollmentId } = await ctx.params;
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const body = (await req.json()) as { status?: string };
      const status = body.status as CourseEnrollmentStatus;
      if (!status || !ALLOWED.includes(status)) {
        return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
      }
      const enrollment = await updateEnrollmentStatus(
        supervisorId,
        id,
        enrollmentId,
        status
      );
      if (!enrollment) {
        return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(enrollment);
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.courses
);
