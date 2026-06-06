export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { createCourseByAdmin, listAllCoursesForAdmin } from "@/lib/db/courses";
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

export const POST = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const supervisorId = typeof body.supervisorId === "string" ? body.supervisorId.trim() : "";
      const title = typeof body.title === "string" ? body.title : "";
      if (!supervisorId || !title.trim()) {
        return NextResponse.json(
          { error: "supervisorId ve title zorunludur." },
          { status: 400 }
        );
      }
      const course = await createCourseByAdmin(supervisorId, {
        title,
        slug: typeof body.slug === "string" ? body.slug : undefined,
        description: typeof body.description === "string" ? body.description : "",
        cover: typeof body.cover === "string" ? body.cover : undefined,
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
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.courses.list
);
