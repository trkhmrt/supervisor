import { type CalendarCellStatus, isPastDate } from "@/lib/calendar-utils";
import type { AvailabilitySlot } from "@/lib/types";

/** Randevu sayfası — slot listesinden gün durumu */
export function bookingDayStatusFromSlots(
  date: string,
  allSlots: AvailabilitySlot[]
): CalendarCellStatus {
  if (isPastDate(date)) return "past";
  const daySlots = allSlots.filter((s) => s.date === date);
  const free = daySlots.filter((s) => !s.isBooked).length;
  const booked = daySlots.filter((s) => s.isBooked).length;
  if (free > 0) return free === daySlots.length ? "available" : "partial";
  if (booked > 0) return "full";
  return "unavailable";
}

export function supervisorDayStatus(
  date: string,
  day: { available: boolean | null; freeCount: number; bookedCount: number } | undefined
): CalendarCellStatus {
  if (isPastDate(date)) return "past";
  if (!day) return "empty";
  if (day.available === false) return "unavailable";
  if (day.freeCount > 0 && day.bookedCount > 0) return "partial";
  if (day.freeCount > 0) return "available";
  if (day.bookedCount > 0) return "full";
  if (day.available === true) return "available";
  return "empty";
}
