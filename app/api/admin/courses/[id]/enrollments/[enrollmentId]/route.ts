export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import type { CourseEnrollmentStatus } from "@prisma/client";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { updateEnrollmentStatusByAdmin } from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string; enrollmentId: string }> };

const ALLOWED: CourseEnrollmentStatus[] = ["pending", "approved", "rejected", "cancelled"];

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { id, enrollmentId } = await ctx.params;
    try {
      const body = (await req.json()) as { status?: string };
      const status = body.status as CourseEnrollmentStatus;
      if (!status || !ALLOWED.includes(status)) {
        return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
      }
      const enrollment = await updateEnrollmentStatusByAdmin(id, enrollmentId, status);
      if (!enrollment) {
        return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(enrollment);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.courses.list
);
