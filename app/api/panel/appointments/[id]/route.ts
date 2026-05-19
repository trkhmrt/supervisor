export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import {
  AppointmentAccessError,
  AppointmentBookingError,
  cancelAppointmentForAuth,
  rescheduleAppointmentForAuth,
} from "@/lib/db/appointments";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, auth, ctx: Ctx) => {
    const { id } = await ctx.params;
    try {
      const body = (await req.json()) as {
        status?: string;
        date?: string;
        startTime?: string;
        endTime?: string;
      };

      if (body.status === "cancelled") {
        const appointment = await cancelAppointmentForAuth(auth, id);
        return NextResponse.json(appointment);
      }

      if (body.date && body.startTime && body.endTime) {
        const appointment = await rescheduleAppointmentForAuth(
          auth,
          id,
          body.date,
          body.startTime,
          body.endTime
        );
        return NextResponse.json(appointment);
      }

      return NextResponse.json({ error: "Desteklenmeyen işlem." }, { status: 400 });
    } catch (e) {
      if (e instanceof AppointmentAccessError) {
        return NextResponse.json({ error: e.message }, { status: 403 });
      }
      if (e instanceof AppointmentBookingError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  { roles: ["user", "supervisor"] }
);
