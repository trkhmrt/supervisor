export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  adminCancelAppointment,
  approveAppointmentPayment,
  AppointmentBookingError,
} from "@/lib/db/appointments";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const body = (await req.json()) as { action?: string };
      if (body.action === "approve_payment") {
        const appointment = await approveAppointmentPayment(id);
        return NextResponse.json(appointment);
      }
      if (body.action === "cancel") {
        const appointment = await adminCancelAppointment(id);
        return NextResponse.json(appointment);
      }
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    } catch (e) {
      if (e instanceof AppointmentBookingError) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.appointments.update
);
