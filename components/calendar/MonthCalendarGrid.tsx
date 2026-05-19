"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CALENDAR_WEEKDAYS_TR,
  type CalendarCellStatus,
  getMonthGridCells,
  monthTitleTr,
} from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<CalendarCellStatus, string> = {
  past: "border-clinical-border/60 bg-clinical-light/80 text-clinical-muted cursor-not-allowed opacity-60",
  empty: "border-clinical-border bg-white text-navy-400 cursor-default",
  unavailable: "border-clinical-border bg-navy-50/80 text-navy-400",
  available: "border-emerald-200 bg-emerald-50 text-navy-900 hover:border-emerald-400 hover:bg-emerald-100",
  partial: "border-amber-200 bg-amber-50 text-navy-900 hover:border-amber-400",
  full: "border-amber-300/80 bg-amber-100/60 text-navy-700 cursor-not-allowed",
};

const STATUS_DOT: Partial<Record<CalendarCellStatus, string>> = {
  available: "bg-emerald-500",
  partial: "bg-amber-500",
  full: "bg-amber-600",
  unavailable: "bg-navy-300",
};

export function MonthCalendarGrid({
  year,
  month,
  selectedDate,
  getStatus,
  onDayClick,
  onMonthChange,
  legend,
  mode = "booking",
}: {
  year: number;
  month: number;
  selectedDate?: string | null;
  getStatus: (date: string) => CalendarCellStatus;
  onDayClick?: (date: string, el: HTMLElement) => void;
  onMonthChange: (year: number, month: number) => void;
  legend?: boolean;
  mode?: "supervisor" | "booking";
}) {
  const cells = getMonthGridCells(year, month);

  function prevMonth() {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  }

  function nextMonth() {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  }

  function canClick(status: CalendarCellStatus): boolean {
    if (status === "past") return false;
    if (mode === "supervisor") return true;
    return status === "available" || status === "partial";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-display font-bold capitalize text-navy-900">
          {monthTitleTr(year, month)}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-clinical-border hover:bg-white"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-clinical-border hover:bg-white"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
        {CALENDAR_WEEKDAYS_TR.map((w) => (
          <div key={w} className="py-1 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`pad-${i}`} className="aspect-square" />;
          }
          const status = getStatus(date);
          const dayNum = Number(date.slice(8, 10));
          const isSelected = selectedDate === date;
          const clickable = canClick(status) && !!onDayClick;

          return (
            <button
              key={date}
              type="button"
              disabled={!clickable && mode === "booking"}
              onClick={(e) => {
                if (mode === "supervisor" && status === "past") return;
                if (mode === "booking" && !clickable) return;
                onDayClick?.(date, e.currentTarget);
              }}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-bold transition",
                STATUS_STYLES[status],
                isSelected && "ring-2 ring-navy-900 ring-offset-1",
                (clickable || (mode === "supervisor" && status !== "past")) &&
                  "cursor-pointer hover:brightness-[0.98] active:scale-95"
              )}
            >
              {dayNum}
              {STATUS_DOT[status] && (
                <span
                  className={cn("absolute bottom-1.5 h-1.5 w-1.5 rounded-full", STATUS_DOT[status])}
                />
              )}
            </button>
          );
        })}
      </div>

      {legend && (
        <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-clinical-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Müsait
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Kısmen dolu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-600" /> Dolu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-navy-300" /> Müsait değil
          </span>
        </div>
      )}
    </div>
  );
}
