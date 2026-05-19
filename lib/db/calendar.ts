import {
  DEFAULT_SLOT_TIMES,
  type CalendarCellStatus,
  isPastDate,
} from "@/lib/calendar-utils";
import {
  clearUnbookedSlotsForDay,
  ensureSlotsForDay,
  listAvailabilityForSupervisor,
} from "@/lib/db/availability";
import { prisma } from "@/lib/prisma";
import type { AvailabilitySlot, SupervisorCalendarDayView, SupervisorCalendarMonthResponse } from "@/lib/types";

function monthBounds(year: number, month: number): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(last)}`;
  return { from, to };
}

function slotsInMonth(slots: AvailabilitySlot[], year: number, month: number): AvailabilitySlot[] {
  const { from, to } = monthBounds(year, month);
  return slots.filter((s) => s.date >= from && s.date <= to);
}

function buildDayView(
  date: string,
  explicit: boolean | null,
  daySlots: AvailabilitySlot[]
): SupervisorCalendarDayView {
  const freeCount = daySlots.filter((s) => !s.isBooked).length;
  const bookedCount = daySlots.filter((s) => s.isBooked).length;
  let available = explicit;
  if (available === null) {
    if (daySlots.length === 0) available = null;
    else available = freeCount > 0;
  }
  return { date, available, freeCount, bookedCount, slots: daySlots };
}

export async function getSupervisorCalendarMonth(
  supervisorId: string,
  year: number,
  month: number
): Promise<SupervisorCalendarMonthResponse> {
  const { from, to } = monthBounds(year, month);
  const [allSlots, calendarRows] = await Promise.all([
    listAvailabilityForSupervisor(supervisorId),
    prisma.supervisorCalendarDay.findMany({
      where: { supervisorId, date: { gte: from, lte: to } },
    }),
  ]);

  const explicitByDate = new Map(calendarRows.map((r) => [r.date, r.available]));
  const slotsByDate = new Map<string, AvailabilitySlot[]>();
  for (const slot of slotsInMonth(allSlots, year, month)) {
    const list = slotsByDate.get(slot.date) ?? [];
    list.push(slot);
    slotsByDate.set(slot.date, list);
  }

  const days: SupervisorCalendarDayView[] = [];
  const last = new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
  for (let d = 1; d <= last; d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d)}`;
    const explicit = explicitByDate.has(date) ? explicitByDate.get(date)! : null;
    days.push(buildDayView(date, explicit, slotsByDate.get(date) ?? []));
  }

  return {
    year,
    month,
    days,
    defaultTimes: [...DEFAULT_SLOT_TIMES],
  };
}

export async function setSupervisorDayAvailability(
  supervisorId: string,
  dateYmd: string,
  available: boolean
): Promise<SupervisorCalendarDayView> {
  await prisma.supervisorCalendarDay.upsert({
    where: { supervisorId_date: { supervisorId, date: dateYmd } },
    create: { supervisorId, date: dateYmd, available },
    update: { available },
  });

  if (available) {
    await ensureSlotsForDay(supervisorId, dateYmd);
  } else {
    await clearUnbookedSlotsForDay(supervisorId, dateYmd);
  }

  const slots = (await listAvailabilityForSupervisor(supervisorId)).filter((s) => s.date === dateYmd);
  return buildDayView(dateYmd, available, slots);
}

export async function setSupervisorSlotEnabled(
  supervisorId: string,
  dateYmd: string,
  startTime: string,
  enabled: boolean
): Promise<SupervisorCalendarDayView> {
  const { findSlotByDayAndStart, createAvailabilitySlot, deleteAvailabilitySlot } = await import(
    "@/lib/db/availability"
  );

  if (enabled) {
    const endTime = (await import("@/lib/calendar-utils")).endTimeFromStart(startTime);
    const existing = await findSlotByDayAndStart(supervisorId, dateYmd, startTime);
    if (!existing) {
      await createAvailabilitySlot(supervisorId, dateYmd, startTime, endTime);
    }
    await prisma.supervisorCalendarDay.upsert({
      where: { supervisorId_date: { supervisorId, date: dateYmd } },
      create: { supervisorId, date: dateYmd, available: true },
      update: { available: true },
    });
  } else {
    const slot = await findSlotByDayAndStart(supervisorId, dateYmd, startTime);
    if (slot) {
      await deleteAvailabilitySlot(supervisorId, slot.id);
    }
  }

  const row = await prisma.supervisorCalendarDay.findUnique({
    where: { supervisorId_date: { supervisorId, date: dateYmd } },
  });
  const slots = (await listAvailabilityForSupervisor(supervisorId)).filter((s) => s.date === dateYmd);
  const explicit = row?.available ?? (slots.length > 0 ? slots.some((s) => !s.isBooked) : null);
  return buildDayView(dateYmd, explicit, slots);
}

/** Randevu UI — ay içi gün durumu */
export function bookingDayStatus(
  date: string,
  slots: AvailabilitySlot[],
  explicitAvailable: boolean | null
): CalendarCellStatus {
  if (isPastDate(date)) return "past";
  const free = slots.filter((s) => !s.isBooked).length;
  const booked = slots.filter((s) => s.isBooked).length;
  if (explicitAvailable === false) return "unavailable";
  if (free > 0) return "available";
  if (booked > 0 && free === 0) return "full";
  if (slots.length === 0) return "unavailable";
  return "empty";
}

export function summarizeSlotsByDate(slots: AvailabilitySlot[]): Map<string, AvailabilitySlot[]> {
  const map = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const list = map.get(slot.date) ?? [];
    list.push(slot);
    map.set(slot.date, list);
  }
  return map;
}
