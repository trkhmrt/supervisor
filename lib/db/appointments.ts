import { prisma } from "@/lib/prisma";
import { generateMeetLink } from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import type { Appointment as PrismaAppointment } from "@prisma/client";

export type CreateAppointmentInput = {
  supervisorId: string;
  superviseeEmail: string;
  superviseeName: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  superviseeId?: string;
};

export function appointmentRowToApi(row: PrismaAppointment): Appointment {
  return {
    id: row.id,
    supervisorId: row.supervisorId,
    supervisorName: row.supervisorName,
    superviseeId: row.superviseeId ?? undefined,
    superviseeName: row.superviseeName,
    superviseeEmail: row.superviseeEmail,
    serviceType: row.serviceType,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status,
    meetLink: row.meetLink ?? undefined,
    paymentApproved: row.paymentApproved,
    amount: row.amount,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export class AppointmentBookingError extends Error {
  constructor(
    message: string,
    readonly code: "SUPERVISOR_NOT_FOUND" | "SLOT_UNAVAILABLE" | "INVALID_INPUT"
  ) {
    super(message);
    this.name = "AppointmentBookingError";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAppointmentInput(
  body: Record<string, unknown>
): CreateAppointmentInput | { error: string } {
  const supervisorId = typeof body.supervisorId === "string" ? body.supervisorId.trim() : "";
  const superviseeEmail =
    typeof body.superviseeEmail === "string" ? body.superviseeEmail.trim().toLowerCase() : "";
  const superviseeName =
    typeof body.superviseeName === "string" ? body.superviseeName.trim() : "";
  const serviceType = typeof body.serviceType === "string" ? body.serviceType.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const startTime = typeof body.startTime === "string" ? body.startTime.trim() : "";
  const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;
  const superviseeId =
    typeof body.superviseeId === "string" && body.superviseeId.trim()
      ? body.superviseeId.trim()
      : undefined;

  if (!supervisorId || !date || !startTime || !endTime || !serviceType) {
    return { error: "Süpervizör, hizmet, tarih ve saat zorunludur." };
  }
  if (!superviseeEmail || !EMAIL_RE.test(superviseeEmail)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }

  const name = superviseeName || superviseeEmail.split("@")[0] || "Misafir";

  return {
    supervisorId,
    superviseeEmail,
    superviseeName: name,
    serviceType,
    date,
    startTime,
    endTime,
    notes: notes || undefined,
    superviseeId,
  };
}

export async function createAppointmentRecord(
  input: CreateAppointmentInput
): Promise<Appointment> {
  const row = await prisma.$transaction(async (tx) => {
    const supervisor = await tx.supervisor.findUnique({ where: { id: input.supervisorId } });
    if (!supervisor) {
      throw new AppointmentBookingError("Süpervizör bulunamadı.", "SUPERVISOR_NOT_FOUND");
    }

    const slot = await tx.availabilitySlot.findFirst({
      where: {
        supervisorId: input.supervisorId,
        date: input.date,
        startTime: input.startTime,
        isBooked: false,
      },
    });

    if (!slot) {
      throw new AppointmentBookingError(
        "Seçilen saat artık müsait değil.",
        "SLOT_UNAVAILABLE"
      );
    }

    const service = await tx.service.findFirst({
      where: {
        active: true,
        OR: [{ id: input.serviceType }, { slug: input.serviceType }],
      },
    });

    await tx.availabilitySlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });

    // Mock/localStorage kullanıcı id'leri (u1 vb.) DB'de yok — FK hatası önlenir.
    let superviseeId: string | null = null;
    if (input.superviseeId) {
      const byId = await tx.user.findUnique({ where: { id: input.superviseeId } });
      if (byId) superviseeId = byId.id;
    }
    if (!superviseeId) {
      const byEmail = await tx.user.findUnique({
        where: { email: input.superviseeEmail },
      });
      if (byEmail) superviseeId = byEmail.id;
    }

    return tx.appointment.create({
      data: {
        supervisorId: input.supervisorId,
        supervisorName: supervisor.fullName,
        superviseeId,
        superviseeName: input.superviseeName,
        superviseeEmail: input.superviseeEmail,
        serviceType: service?.id ?? input.serviceType,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        amount: supervisor.pricePerSession,
        notes: input.notes,
        status: "pending_payment",
        meetLink: generateMeetLink(),
      },
    });
  });

  return appointmentRowToApi(row);
}
