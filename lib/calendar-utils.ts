import { parseYmd, ymdFromDate } from "@/lib/datetime";

export const CALENDAR_WEEKDAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] as const;

export const DEFAULT_SLOT_TIMES = ["09:00", "10:30", "13:00", "15:00", "17:00"] as const;

/** Randevu / takvim hücreleri */
export type CalendarCellStatus =
  | "past"
  | "empty"
  | "unavailable"
  | "available"
  | "partial"
  | "full";

export function todayYmd(): string {
  return ymdFromDate(new Date());
}

export function isPastDate(ymd: string): boolean {
  return ymd < todayYmd();
}

export function endTimeFromStart(startTime: string, minutes = 50): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Ay ızgarası: null = boş hücre */
export function getMonthGridCells(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  const lastDay = new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
  const startPad = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= lastDay; d++) {
    const ymd = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(ymd);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function monthTitleTr(year: number, month: number): string {
  return new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

export function dayLabelTr(ymd: string): string {
  return parseYmd(ymd).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
