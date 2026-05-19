import { parseYmd, sessionFromParts, sessionToParts } from "@/lib/datetime";
import { DEFAULT_SLOT_TIMES, endTimeFromStart } from "@/lib/calendar-utils";
import { prisma } from "@/lib/prisma";
import { addDaysISO } from "@/lib/utils";
import type { AvailabilitySlot } from "@/lib/types";

const DEFAULT_TIMES = [...DEFAULT_SLOT_TIMES];

function dayUtcRange(dateYmd: string): { start: Date; end: Date } {
  const start = parseYmd(dateYmd);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/** Süpervizörün müsaitlik kaydı yoksa önümüzdeki 21 gün için varsayılan slotlar oluşturur. */
export async function ensureDefaultAvailabilitySlots(supervisorId: string): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) return;

  const count = await prisma.availabilitySlot.count({ where: { supervisorId } });
  if (count > 0) return;

  const data: {
    supervisorId: string;
    startsAt: Date;
    endsAt: Date;
    isBooked: boolean;
  }[] = [];

  for (let day = 1; day <= 21; day++) {
    const date = addDaysISO(day);
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    if (dayOfWeek === 0) continue;

    for (const startTime of DEFAULT_TIMES) {
      const endTime = endTimeFromStart(startTime);
      const session = sessionFromParts(date, startTime, endTime);
      data.push({
        supervisorId,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        isBooked: false,
      });
    }
  }

  if (data.length > 0) {
    await prisma.availabilitySlot.createMany({ data });
  }
}

function slotRowToApi(row: {
  id: string;
  supervisorId: string;
  startsAt: Date;
  endsAt: Date;
  isBooked: boolean;
}): AvailabilitySlot {
  return {
    id: row.id,
    supervisorId: row.supervisorId,
    ...sessionToParts(row.startsAt, row.endsAt),
    isBooked: row.isBooked,
  };
}

export async function listAvailabilityForSupervisor(
  supervisorId: string
): Promise<AvailabilitySlot[]> {
  const rows = await prisma.availabilitySlot.findMany({
    where: { supervisorId },
    orderBy: { startsAt: "asc" },
  });
  return rows.map(slotRowToApi);
}

export async function createAvailabilitySlot(
  supervisorId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<AvailabilitySlot> {
  const session = sessionFromParts(date, startTime, endTime);
  const duplicate = await prisma.availabilitySlot.findFirst({
    where: { supervisorId, startsAt: session.startsAt },
  });
  if (duplicate) {
    throw new AvailabilityError("Bu saat zaten tanımlı.");
  }

  const row = await prisma.availabilitySlot.create({
    data: {
      supervisorId,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      isBooked: false,
    },
  });
  return slotRowToApi(row);
}

export async function deleteAvailabilitySlot(
  supervisorId: string,
  slotId: string
): Promise<boolean> {
  const slot = await prisma.availabilitySlot.findFirst({
    where: { id: slotId, supervisorId },
  });
  if (!slot) return false;
  if (slot.isBooked) {
    throw new AvailabilityError("Dolu slot silinemez.");
  }
  await prisma.availabilitySlot.delete({ where: { id: slotId } });
  return true;
}

/** Tek gün için varsayılan saat slotlarını oluşturur (yoksa). */
export async function ensureSlotsForDay(supervisorId: string, dateYmd: string): Promise<void> {
  for (const startTime of DEFAULT_TIMES) {
    const endTime = endTimeFromStart(startTime);
    const session = sessionFromParts(dateYmd, startTime, endTime);
    const exists = await prisma.availabilitySlot.findFirst({
      where: { supervisorId, startsAt: session.startsAt },
    });
    if (!exists) {
      await prisma.availabilitySlot.create({
        data: {
          supervisorId,
          startsAt: session.startsAt,
          endsAt: session.endsAt,
          isBooked: false,
        },
      });
    }
  }
}

/** Gün içindeki boş slotları kaldırır; dolu slotlar kalır. */
export async function clearUnbookedSlotsForDay(supervisorId: string, dateYmd: string): Promise<void> {
  const { start, end } = dayUtcRange(dateYmd);
  await prisma.availabilitySlot.deleteMany({
    where: { supervisorId, startsAt: { gte: start, lt: end }, isBooked: false },
  });
}

export async function findSlotByDayAndStart(
  supervisorId: string,
  dateYmd: string,
  startTime: string
) {
  const endTime = endTimeFromStart(startTime);
  const session = sessionFromParts(dateYmd, startTime, endTime);
  return prisma.availabilitySlot.findFirst({
    where: { supervisorId, startsAt: session.startsAt },
  });
}

export class AvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvailabilityError";
  }
}
