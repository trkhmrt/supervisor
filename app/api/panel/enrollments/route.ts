export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listEnrollmentsForUser } from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (_req, auth) => {
    try {
      const enrollments = await listEnrollmentsForUser(auth.userId);
      return NextResponse.json(enrollments);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.panel.enrollmentsList
);
