export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  createCourseByAdmin,
  deleteCourseByAdmin,
  updateCourseByAdmin,
} from "@/lib/db/courses";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { id } = await ctx.params;
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const course = await updateCourseByAdmin(id, {
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
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.courses.list
);

export const DELETE = withAuth(
  async (_req, _auth, ctx: Ctx) => {
    const { id } = await ctx.params;
    try {
      const ok = await deleteCourseByAdmin(id);
      if (!ok) {
        return NextResponse.json({ error: "Kurs bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.courses.list
);
