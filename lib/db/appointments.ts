import { Prisma } from "@prisma/client";
import type { AuthContext } from "@/lib/auth/guard";
import { sessionFromParts, sessionToParts } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { generateMeetLink } from "@/lib/utils";
import {
  appointmentConfirmedEmailHtml,
  sendEmail,
} from "@/lib/email/send";
import type { Appointment } from "@/lib/types";
import type { Appointment as PrismaAppointment } from "@prisma/client";
import { isValidPhone, normalizePhone } from "@/lib/validation/phone";

const APPOINTMENT_LIST_SELECT = {
  id: true,
  supervisorId: true,
  supervisorName: true,
  userId: true,
  superviseeName: true,
  superviseeEmail: true,
  superviseePhone: true,
  serviceType: true,
  serviceGroupId: true,
  serviceGroup: { select: { name: true } },
  startsAt: true,
  endsAt: true,
  status: true,
  meetLink: true,
  paymentApproved: true,
  amount: true,
  createdAt: true,
} satisfies Prisma.AppointmentSelect;

type AppointmentListRow = Prisma.AppointmentGetPayload<{ select: typeof APPOINTMENT_LIST_SELECT }>;

type AppointmentRow = PrismaAppointment | AppointmentListRow;

export const APPOINTMENT_LIST_DEFAULT_LIMIT = 20;
export const APPOINTMENT_LIST_MAX_LIMIT = 50;

export type AppointmentListOptions = {
  limit?: number;
  offset?: number;
};

export type AppointmentListResult = {
  items: Appointment[];
  hasMore: boolean;
  nextOffset: number | null;
};

export class AppointmentAccessError extends Error {
  constructor(message = "Bu randevuya erişim yok.") {
    super(message);
    this.name = "AppointmentAccessError";
  }
}

export type CreateAppointmentInput = {
  supervisorId: string;
  superviseeEmail: string;
  superviseeName: string;
  superviseePhone: string;
  serviceType: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  serviceGroupId?: string;
  notes?: string;
  userId?: number;
};

export function appointmentRowToApi(row: AppointmentRow): Appointment {
  const parts = sessionToParts(row.startsAt, row.endsAt);
  const groupName =
    "serviceGroup" in row && row.serviceGroup?.name ? row.serviceGroup.name : undefined;
  return {
    id: row.id,
    supervisorId: row.supervisorId,
    supervisorName: row.supervisorName,
    userId: row.userId ?? undefined,
    superviseeName: row.superviseeName,
    superviseeEmail: row.superviseeEmail,
    superviseePhone: row.superviseePhone,
    serviceType: row.serviceType,
    serviceGroupId: "serviceGroupId" in row ? row.serviceGroupId ?? undefined : undefined,
    serviceGroupName: groupName,
    ...parts,
    status: row.status,
    meetLink: row.meetLink ?? undefined,
    paymentApproved: row.paymentApproved,
    amount: row.amount,
    notes: "notes" in row && row.notes != null ? row.notes : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export class AppointmentBookingError extends Error {
  constructor(
    message: string,
    readonly code:
      | "SUPERVISOR_NOT_FOUND"
      | "SLOT_UNAVAILABLE"
      | "GROUP_UNAVAILABLE"
      | "GROUP_FULL"
      | "INVALID_INPUT"
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
  const superviseePhone =
    typeof body.superviseePhone === "string" ? body.superviseePhone.trim() : "";
  const serviceType = typeof body.serviceType === "string" ? body.serviceType.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const startTime = typeof body.startTime === "string" ? body.startTime.trim() : "";
  const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";
  const serviceGroupId =
    typeof body.serviceGroupId === "string" ? body.serviceGroupId.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;

  let userId: number | undefined;
  if (typeof body.userId === "number" && Number.isFinite(body.userId)) {
    userId = body.userId;
  } else if (typeof body.userId === "string" && body.userId.trim()) {
    const n = Number.parseInt(body.userId, 10);
    if (Number.isFinite(n) && n > 0) userId = n;
  }

  if (!supervisorId || !serviceType) {
    return { error: "Süpervizör ve hizmet zorunludur." };
  }
  if (!serviceGroupId && (!date || !startTime || !endTime)) {
    return { error: "Tarih ve saat zorunludur." };
  }
  if (serviceGroupId && (date || startTime || endTime)) {
    return { error: "Grup hizmetinde tarih/saat seçimi gerekmez." };
  }
  if (!superviseeEmail || !EMAIL_RE.test(superviseeEmail)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }
  if (!superviseePhone || !isValidPhone(superviseePhone)) {
    return { error: "Geçerli bir telefon numarası girin." };
  }

  const name = superviseeName || superviseeEmail.split("@")[0] || "Misafir";
  const phone = normalizePhone(superviseePhone);

  return {
    supervisorId,
    superviseeEmail,
    superviseeName: name,
    superviseePhone: phone,
    serviceType,
    date: date || undefined,
    startTime: startTime || undefined,
    endTime: endTime || undefined,
    serviceGroupId: serviceGroupId || undefined,
    notes: notes || undefined,
    userId,
  };
}

export async function createAppointmentRecord(
  input: CreateAppointmentInput
): Promise<Appointment> {
  if (input.serviceGroupId) {
    return createGroupAppointmentRecord(input);
  }

  const session = sessionFromParts(input.date!, input.startTime!, input.endTime!);

  const row = await prisma.$transaction(async (tx) => {
    const supervisor = await tx.supervisor.findUnique({ where: { id: input.supervisorId } });
    if (!supervisor) {
      throw new AppointmentBookingError("Süpervizör bulunamadı.", "SUPERVISOR_NOT_FOUND");
    }

    const slot = await tx.availabilitySlot.findFirst({
      where: {
        supervisorId: input.supervisorId,
        startsAt: session.startsAt,
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

    let userId: number | null = null;
    if (input.userId) {
      const byId = await tx.user.findUnique({ where: { id: input.userId } });
      if (byId) userId = byId.id;
    }
    if (!userId) {
      const byEmail = await tx.user.findUnique({
        where: { email: input.superviseeEmail },
      });
      if (byEmail) userId = byEmail.id;
    }

    return tx.appointment.create({
      data: {
        supervisorId: input.supervisorId,
        supervisorName: supervisor.fullName,
        userId,
        superviseeName: input.superviseeName,
        superviseeEmail: input.superviseeEmail,
        superviseePhone: input.superviseePhone,
        serviceType: service?.id ?? input.serviceType,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        amount: supervisor.sessionFeeOnRequest ? 0 : supervisor.pricePerSession,
        notes: input.notes,
        status: "pending_payment",
        meetLink: generateMeetLink(),
      },
      select: APPOINTMENT_LIST_SELECT,
    });
  });

  return appointmentRowToApi(row);
}

async function createGroupAppointmentRecord(input: CreateAppointmentInput): Promise<Appointment> {
  const row = await prisma.$transaction(async (tx) => {
    const supervisor = await tx.supervisor.findUnique({ where: { id: input.supervisorId } });
    if (!supervisor) {
      throw new AppointmentBookingError("Süpervizör bulunamadı.", "SUPERVISOR_NOT_FOUND");
    }

    const group = await tx.serviceGroup.findFirst({
      where: {
        id: input.serviceGroupId,
        supervisorId: input.supervisorId,
        active: true,
      },
      include: { service: true },
    });

    if (!group) {
      throw new AppointmentBookingError("Grup bulunamadı.", "GROUP_UNAVAILABLE");
    }

    if (!group.service.isGroupService || !group.service.active) {
      throw new AppointmentBookingError("Bu hizmet grup başvurusu kabul etmiyor.", "GROUP_UNAVAILABLE");
    }

    const serviceMatch =
      group.service.id === input.serviceType || group.service.slug === input.serviceType;
    if (!serviceMatch) {
      throw new AppointmentBookingError("Seçilen grup bu hizmete ait değil.", "GROUP_UNAVAILABLE");
    }

    const enrolledCount = await tx.serviceGroupEnrollment.count({
      where: {
        groupId: group.id,
        appointment: { status: { not: "cancelled" } },
      },
    });

    if (enrolledCount >= group.capacity) {
      throw new AppointmentBookingError("Bu grup dolu.", "GROUP_FULL");
    }

    const duplicate = await tx.serviceGroupEnrollment.findFirst({
      where: {
        groupId: group.id,
        superviseeEmail: input.superviseeEmail,
        appointment: { status: { not: "cancelled" } },
      },
    });
    if (duplicate) {
      throw new AppointmentBookingError("Bu gruba zaten kayıtlısınız.", "GROUP_UNAVAILABLE");
    }

    let userId: number | null = null;
    if (input.userId) {
      const byId = await tx.user.findUnique({ where: { id: input.userId } });
      if (byId) userId = byId.id;
    }
    if (!userId) {
      const byEmail = await tx.user.findUnique({
        where: { email: input.superviseeEmail },
      });
      if (byEmail) userId = byEmail.id;
    }

    const startsAt =
      group.startsAt ??
      new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1, 10, 0, 0));
    const endsAt =
      group.endsAt ??
      new Date(startsAt.getTime() + (group.service.duration || 50) * 60 * 1000);

    const appointment = await tx.appointment.create({
      data: {
        supervisorId: input.supervisorId,
        supervisorName: supervisor.fullName,
        userId,
        superviseeName: input.superviseeName,
        superviseeEmail: input.superviseeEmail,
        superviseePhone: input.superviseePhone,
        serviceType: group.service.id,
        serviceGroupId: group.id,
        startsAt,
        endsAt,
        amount: group.service.price || (supervisor.sessionFeeOnRequest ? 0 : supervisor.pricePerSession),
        notes: input.notes,
        status: "pending_payment",
        meetLink: generateMeetLink(),
      },
    });

    await tx.serviceGroupEnrollment.create({
      data: {
        groupId: group.id,
        appointmentId: appointment.id,
        superviseeEmail: input.superviseeEmail,
        superviseeName: input.superviseeName,
        userId,
      },
    });

    return tx.appointment.findUniqueOrThrow({
      where: { id: appointment.id },
      select: APPOINTMENT_LIST_SELECT,
    });
  });

  return appointmentRowToApi(row);
}

function appointmentWhereForAuth(auth: AuthContext): Prisma.AppointmentWhereInput {
  if (auth.role === "supervisor") {
    return { supervisor: { userId: auth.userId } };
  }
  return {
    OR: [{ userId: auth.userId }, { superviseeEmail: auth.email.toLowerCase() }],
  };
}

function clampListLimit(limit?: number): number {
  const n = limit ?? APPOINTMENT_LIST_DEFAULT_LIMIT;
  return Math.min(Math.max(1, n), APPOINTMENT_LIST_MAX_LIMIT);
}

export async function listAppointmentsForAuth(
  auth: AuthContext,
  options: AppointmentListOptions = {}
): Promise<AppointmentListResult> {
  const limit = clampListLimit(options.limit);
  const offset = Math.max(0, options.offset ?? 0);
  const where = appointmentWhereForAuth(auth);

  const rows = await prisma.appointment.findMany({
    where,
    select: APPOINTMENT_LIST_SELECT,
    orderBy: { startsAt: "desc" },
    take: limit + 1,
    skip: offset,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: page.map(appointmentRowToApi),
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function cancelAppointmentForAuth(
  auth: AuthContext,
  appointmentId: string
): Promise<Appointment> {
  const accessWhere = appointmentWhereForAuth(auth);
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, ...accessWhere },
    include: { supervisor: true },
  });

  if (!existing) {
    throw new AppointmentAccessError();
  }

  if (existing.status === "cancelled" || existing.status === "completed") {
    throw new AppointmentBookingError("Bu randevu iptal edilemez.", "INVALID_INPUT");
  }

  const row = await prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findFirst({
      where: {
        supervisorId: existing.supervisorId,
        startsAt: existing.startsAt,
      },
    });
    if (slot) {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: false },
      });
    }

    return tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });
  });

  return appointmentRowToApi(row);
}

export async function listAllAppointmentsForAdmin(
  options: AppointmentListOptions = {}
): Promise<AppointmentListResult> {
  const limit = clampListLimit(options.limit);
  const offset = Math.max(0, options.offset ?? 0);

  const rows = await prisma.appointment.findMany({
    select: APPOINTMENT_LIST_SELECT,
    orderBy: { startsAt: "desc" },
    take: limit + 1,
    skip: offset,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: page.map(appointmentRowToApi),
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  };
}

export async function approveAppointmentPayment(appointmentId: string): Promise<Appointment> {
  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { supervisor: { include: { user: true } } },
  });
  if (!existing) {
    throw new AppointmentBookingError("Randevu bulunamadı.", "INVALID_INPUT");
  }

  const meetLink = existing.meetLink ?? generateMeetLink();
  const row = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      paymentApproved: true,
      status: "confirmed",
      meetLink,
    },
  });

  const api = appointmentRowToApi(row);
  const html = appointmentConfirmedEmailHtml({
    recipientName: existing.superviseeName,
    supervisorName: existing.supervisorName,
    date: api.date,
    startTime: api.startTime,
    endTime: api.endTime,
    meetLink,
  });

  await sendEmail({
    to: existing.superviseeEmail,
    subject: `Randevunuz onaylandı — ${existing.supervisorName}`,
    html,
  });

  const supervisorEmail = existing.supervisor.user?.email;
  if (supervisorEmail) {
    await sendEmail({
      to: supervisorEmail,
      subject: `Yeni onaylı randevu — ${existing.superviseeName}`,
      html: appointmentConfirmedEmailHtml({
        recipientName: existing.supervisorName,
        supervisorName: existing.superviseeName,
        date: api.date,
        startTime: api.startTime,
        endTime: api.endTime,
        meetLink,
      }),
    });
  }

  return api;
}

export async function adminCancelAppointment(appointmentId: string): Promise<Appointment> {
  const existing = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!existing) {
    throw new AppointmentBookingError("Randevu bulunamadı.", "INVALID_INPUT");
  }
  if (existing.status === "cancelled" || existing.status === "completed") {
    throw new AppointmentBookingError("Bu randevu iptal edilemez.", "INVALID_INPUT");
  }

  const row = await prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findFirst({
      where: { supervisorId: existing.supervisorId, startsAt: existing.startsAt },
    });
    if (slot) {
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { isBooked: false } });
    }
    return tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });
  });

  return appointmentRowToApi(row);
}

export async function rescheduleAppointmentForAuth(
  auth: AuthContext,
  appointmentId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<Appointment> {
  const accessWhere = appointmentWhereForAuth(auth);
  const existing = await prisma.appointment.findFirst({
    where: { id: appointmentId, ...accessWhere },
  });
  if (!existing) {
    throw new AppointmentAccessError();
  }
  if (existing.status === "cancelled" || existing.status === "completed") {
    throw new AppointmentBookingError("Bu randevu yeniden planlanamaz.", "INVALID_INPUT");
  }

  const session = sessionFromParts(date, startTime, endTime);

  const row = await prisma.$transaction(async (tx) => {
    const oldSlot = await tx.availabilitySlot.findFirst({
      where: { supervisorId: existing.supervisorId, startsAt: existing.startsAt },
    });
    if (oldSlot) {
      await tx.availabilitySlot.update({ where: { id: oldSlot.id }, data: { isBooked: false } });
    }

    const newSlot = await tx.availabilitySlot.findFirst({
      where: {
        supervisorId: existing.supervisorId,
        startsAt: session.startsAt,
        isBooked: false,
      },
    });
    if (!newSlot) {
      throw new AppointmentBookingError("Seçilen saat müsait değil.", "SLOT_UNAVAILABLE");
    }

    await tx.availabilitySlot.update({ where: { id: newSlot.id }, data: { isBooked: true } });

    return tx.appointment.update({
      where: { id: appointmentId },
      data: {
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        status: "rescheduled",
      },
    });
  });

  return appointmentRowToApi(row);
}
