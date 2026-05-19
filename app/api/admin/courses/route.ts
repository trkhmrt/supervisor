export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listAllCoursesForAdmin } from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const q = searchParams.get("q") ?? undefined;
      const supervisorId = searchParams.get("supervisorId") ?? undefined;
      const activeParam = searchParams.get("active");
      let active: boolean | undefined;
      if (activeParam === "true") active = true;
      if (activeParam === "false") active = false;

      return NextResponse.json(
        await listAllCoursesForAdmin({ q, supervisorId, active })
      );
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.courses.list
);
