"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { dayLabelTr } from "@/lib/calendar-utils";
import { supervisorDayStatus } from "@/lib/calendar-booking";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import type { SessionUser } from "@/lib/types";
import type { SupervisorCalendarDayView, SupervisorCalendarMonthResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

type PopoverState = {
  date: string;
  anchor: DOMRect;
};

export function SupervisorCalendarPanel({ user }: { user: SessionUser }) {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [data, setData] = useState<SupervisorCalendarMonthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [saving, setSaving] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await panelFetch(user, `/api/panel/calendar?year=${year}&month=${month}`);
      if (!res.ok) throw new Error(await panelErrorMessage(res, "Takvim yüklenemedi"));
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const dayMap = useMemo(() => {
    const m = new Map<string, SupervisorCalendarDayView>();
    for (const d of data?.days ?? []) m.set(d.date, d);
    return m;
  }, [data]);

  const activeDay = popover ? dayMap.get(popover.date) : undefined;
  const defaultTimes = data?.defaultTimes ?? ["09:00", "10:30", "13:00", "15:00", "17:00"];

  useEffect(() => {
    if (!popover) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (popoverRef.current?.contains(t)) return;
      setPopover(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [popover]);

  async function patchDay(body: Record<string, unknown>) {
    if (!popover) return;
    setSaving(true);
    setError(null);
    try {
      const res = await panelFetch(user, "/api/panel/calendar/day", {
        method: "PATCH",
        body: JSON.stringify({ date: popover.date, ...body }),
      });
      if (!res.ok) throw new Error(await panelErrorMessage(res, "Kaydedilemedi"));
      const updated = (await res.json()) as SupervisorCalendarDayView;
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((d) => (d.date === updated.date ? updated : d)),
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  const popoverStyle = popover
    ? {
        top: Math.min(popover.anchor.bottom + 8, window.innerHeight - 280),
        left: Math.min(
          Math.max(8, popover.anchor.left + popover.anchor.width / 2 - 160),
          window.innerWidth - 328
        ),
      }
    : undefined;

  return (
    <>
      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted py-12">
          <Loader2 className="h-4 w-4 animate-spin" />
          Takvim yükleniyor…
        </div>
      ) : (
        <div className="card-premium p-6 sm:p-8">
          <MonthCalendarGrid
            year={year}
            month={month}
            mode="supervisor"
            legend
            getStatus={(date) => supervisorDayStatus(date, dayMap.get(date))}
            onMonthChange={(y, m) => {
              setPopover(null);
              setYear(y);
              setMonth(m);
            }}
            onDayClick={(date, el) => {
              setPopover({ date, anchor: el.getBoundingClientRect() });
            }}
          />
          <p className="mt-6 text-xs text-clinical-muted leading-relaxed">
            Bir güne tıklayarak o günü müsait veya müsait değil işaretleyin; müsait günlerde saat
            dilimlerini açıp kapatabilirsiniz. Randevu alan danışanlar yeşil günlerde boş saatleri
            görür.
          </p>
        </div>
      )}

      {popover &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Gün ayarları"
            style={popoverStyle}
            className="fixed z-[200] w-[min(20rem,calc(100vw-1rem))] rounded-premium border border-clinical-border bg-white p-4 shadow-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  Gün
                </p>
                <p className="text-sm font-bold text-navy-900 capitalize">{dayLabelTr(popover.date)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPopover(null)}
                className="rounded-lg p-1 text-clinical-muted hover:bg-clinical-light"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void patchDay({ available: true })}
                className={cn(
                  "rounded-premium border py-2 text-xs font-bold transition",
                  activeDay?.available !== false
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-clinical-border hover:bg-clinical-light"
                )}
              >
                Müsait
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void patchDay({ available: false })}
                className={cn(
                  "rounded-premium border py-2 text-xs font-bold transition",
                  activeDay?.available === false
                    ? "border-navy-400 bg-navy-50 text-navy-900"
                    : "border-clinical-border hover:bg-clinical-light"
                )}
              >
                Müsait değil
              </button>
            </div>

            {activeDay?.available !== false && (
              <div className="space-y-2 border-t border-clinical-border pt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  Saat dilimleri
                </p>
                <div className="flex flex-wrap gap-2">
                  {defaultTimes.map((t) => {
                    const slot = activeDay?.slots.find((s) => s.startTime === t);
                    const on = !!slot && !slot.isBooked;
                    const booked = !!slot?.isBooked;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={saving || booked}
                        title={booked ? "Randevu dolu" : undefined}
                        onClick={() => void patchDay({ startTime: t, enabled: !on })}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-bold border transition",
                          booked && "border-amber-300 bg-amber-50 text-amber-900 cursor-not-allowed",
                          on && !booked && "border-emerald-500 bg-emerald-50 text-emerald-900",
                          !on && !booked && "border-clinical-border text-navy-600 hover:bg-clinical-light"
                        )}
                      >
                        {t}
                        {booked && " · Dolu"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {saving && (
              <p className="mt-3 flex items-center gap-2 text-xs text-clinical-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                Kaydediliyor…
              </p>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
