export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { AvailabilityError, deleteAvailabilitySlot } from "@/lib/db/availability";
import {
  requireSupervisorIdForUser,
  SupervisorAccountError,
} from "@/lib/db/supervisor-account";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withAuth(
  async (_req, auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const supervisorId = await requireSupervisorIdForUser(auth.userId);
      const ok = await deleteAvailabilitySlot(supervisorId, id);
      if (!ok) {
        return NextResponse.json({ error: "Slot bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      if (e instanceof SupervisorAccountError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      if (e instanceof AvailabilityError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.supervisor.availability
);
