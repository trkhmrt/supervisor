export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  AppointmentBookingError,
  createAppointmentRecord,
  validateAppointmentInput,
} from "@/lib/db/appointments";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const POST = withAuth(async (req, auth) => {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const parsed = validateAppointmentInput({
      ...body,
      userId: auth.userId,
      superviseeEmail: auth.email,
    });

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const appointment = await createAppointmentRecord(parsed);
    return NextResponse.json(appointment, { status: 201 });
  } catch (e) {
    if (e instanceof AppointmentBookingError) {
      const status =
        e.code === "SUPERVISOR_NOT_FOUND"
          ? 404
          : e.code === "SLOT_UNAVAILABLE" || e.code === "GROUP_FULL" || e.code === "GROUP_UNAVAILABLE"
            ? 409
            : 400;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    return NextResponse.json(
      { error: prismaUnavailableMessage(e) },
      { status: 503 }
    );
  }
}, GUARD.panel.appointmentsCreate);
