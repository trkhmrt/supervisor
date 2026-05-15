"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  Check,
  LogIn,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { ServiceType } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function BookingPanel({
  supervisorId,
  serviceType = "individual",
}: {
  supervisorId: string;
  serviceType?: ServiceType;
}) {
  const supervisor = useAppStore((s) => s.supervisors.find((x) => x.id === supervisorId));
  const services = useAppStore((s) => s.services);
  const user = useCurrentUser();
  const createAppointment = useAppStore((s) => s.createAppointment);

  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);

  const service = services.find((s) => s.id === serviceType);

  const groupedByDate = useMemo(() => {
    if (!supervisor) return {};
    const map: Record<string, typeof supervisor.availability> = {};

    for (const slot of supervisor.availability) {
      if (slot.isBooked) continue;
      (map[slot.date] = map[slot.date] || []).push(slot);
    }

    return map;
  }, [supervisor]);

  const dates = Object.keys(groupedByDate).slice(0, 14);
  const maxWeek = Math.max(0, Math.ceil(dates.length / 7) - 1);
  const visibleDates = dates.slice(weekIndex * 7, weekIndex * 7 + 7);

  useEffect(() => {
    if (!dates.length) return;
    setSelectedDate((prev) => prev ?? dates[0]);
  }, [dates]);

  useEffect(() => {
    if (!visibleDates.length) return;
    if (selectedDate && visibleDates.includes(selectedDate)) return;
    setSelectedDate(visibleDates[0]);
    setSelectedSlot(null);
  }, [selectedDate, visibleDates]);

  if (!supervisor || !service) return null;

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const monthTitle = selectedDateObj
    ? selectedDateObj.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
    : "Takvim";

  const daySlots = selectedDate ? groupedByDate[selectedDate] ?? [] : [];
  const morningSlots = daySlots.filter((slot) => Number(slot.startTime.split(":")[0]) < 12);
  const noonSlots = daySlots.filter((slot) => Number(slot.startTime.split(":")[0]) >= 12);

  return (
    <div className="card-premium card-flat-hover mx-auto w-full max-w-xl overflow-hidden bg-white p-6 shadow-none sm:p-8">
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <section className="space-y-6">
              <h3 className="font-display text-4xl font-bold tracking-tight text-black">
                Randevu Al
              </h3>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold capitalize text-black">{monthTitle}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeekIndex((prev) => Math.max(0, prev - 1))}
                    disabled={weekIndex === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-clinical-border text-black transition disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Onceki hafta"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekIndex((prev) => Math.min(maxWeek, prev + 1))}
                    disabled={weekIndex >= maxWeek}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-clinical-border text-black transition disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Sonraki hafta"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {visibleDates.map((date) => {
                  const dayDate = new Date(date);
                  const isSelected = selectedDate === date;

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className="space-y-2"
                    >
                      <div className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                        {dayDate.toLocaleDateString("tr-TR", { weekday: "short" })}
                      </div>
                      <div
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold transition ${
                          isSelected ? "bg-black text-white" : "bg-white text-black"
                        }`}
                      >
                        {dayDate.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="mb-4 font-display text-4xl font-bold tracking-tight text-black">Saat</h4>

              <div className="space-y-5">
                {morningSlots.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-clinical-muted">
                      Sabah
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {morningSlots.map((slot) => {
                        const isSelected = selectedSlot?.start === slot.startTime;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              setSelectedSlot({ start: slot.startTime, end: slot.endTime })
                            }
                            className={`rounded-2xl px-4 py-3 text-lg font-bold transition ${
                              isSelected
                                ? "bg-black text-white"
                                : "border border-clinical-border bg-white text-black"
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {noonSlots.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-clinical-muted">
                      Gun
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {noonSlots.map((slot) => {
                        const isSelected = selectedSlot?.start === slot.startTime;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              setSelectedSlot({ start: slot.startTime, end: slot.endTime })
                            }
                            className={`rounded-2xl px-4 py-3 text-lg font-bold transition ${
                              isSelected
                                ? "bg-black text-white"
                                : "border border-clinical-border bg-white text-black"
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {daySlots.length === 0 && (
                  <div className="rounded-xl border border-clinical-border bg-white p-4 text-sm text-clinical-muted">
                    Bu gunde uygun saat bulunamadi.
                  </div>
                )}
              </div>
            </section>

            <div className="border-t border-clinical-border pt-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-clinical-muted">
                <CalendarDays className="h-4 w-4" />
                Secilen:
                <span className="font-bold text-black">
                  {selectedDate || "-"} {selectedSlot?.start || ""}
                </span>
              </div>
              <button
                type="button"
                disabled={!selectedDate || !selectedSlot}
                onClick={() => setStep("confirm")}
                className="w-full rounded-2xl bg-[#d1f90b] px-6 py-4 text-xl font-bold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Randevu Al
              </button>
            </div>
          </motion.div>
        )}

        {step === "confirm" && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <button
              type="button"
              onClick={() => setStep("select")}
              className="flex items-center gap-2 text-xs font-bold text-navy-500 transition-colors hover:text-navy-900"
            >
              <ChevronLeft className="h-4 w-4" /> Geri Don
            </button>

            <div className="space-y-6 rounded-premium border border-clinical-border bg-clinical-light p-8">
              <div className="flex items-center justify-between border-b border-clinical-border pb-4">
                <span className="text-sm text-clinical-muted">Uzman</span>
                <span className="font-bold text-navy-900">{supervisor.fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-clinical-border pb-4">
                <span className="text-sm text-clinical-muted">Hizmet</span>
                <span className="font-bold text-navy-900">{service.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-clinical-border pb-4">
                <span className="text-sm text-clinical-muted">Tarih & Saat</span>
                <span className="font-bold text-navy-900">
                  {selectedDate} @ {selectedSlot?.start}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-clinical-muted">Toplam Ucret</span>
                <span className="text-2xl font-bold text-navy-900">
                  {formatPrice(supervisor.pricePerSession)}
                </span>
              </div>
            </div>

            {!user ? (
              <div className="flex items-center justify-between gap-6 rounded-premium border border-navy-100 bg-navy-50 p-6">
                <p className="text-sm leading-relaxed text-navy-900">
                  Randevu olusturmak icin giris yapmaniz gerekmektedir.
                </p>
                <Link href="/giris" className="btn-navy shrink-0">
                  Giris Yap
                  <LogIn className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-navy-500">
                    Notlariniz (Opsiyonel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Supervizorunuze iletmek istediginiz kisa bir not..."
                    className="h-24 w-full resize-none rounded-premium border border-clinical-border bg-white p-4 text-sm focus:border-navy-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const app = createAppointment({
                      supervisorId: supervisor.id,
                      supervisorName: supervisor.fullName,
                      superviseeId: user.id,
                      superviseeName: user.fullName,
                      superviseeEmail: user.email,
                      serviceType,
                      date: selectedDate!,
                      startTime: selectedSlot!.start,
                      endTime: selectedSlot!.end,
                      amount: supervisor.pricePerSession,
                      notes,
                    });
                    setAppointmentId(app.id);
                    setStep("done");
                  }}
                  className="btn-navy w-full py-4 text-base"
                >
                  Randevuyu Onayla
                  <CreditCard className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-10 text-center"
          >
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check className="h-10 w-10" />
            </div>
            <h3 className="h2-premium mb-4">Randevunuz Onaylandi</h3>
            <p className="mx-auto mb-10 max-w-sm text-clinical-muted">
              Talebiniz basariyla kaydedildi. Randevu detaylari ve Google Meet linki e-posta
              adresinize gonderilmistir.
            </p>

            <div className="mb-10 rounded-premium border border-clinical-border bg-clinical-light p-6 text-left">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                Randevu Kodu
              </div>
              <div className="font-mono font-bold text-navy-900">{appointmentId}</div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/panelim" className="btn-navy">
                Panelime Git
              </Link>
              <Link href="/" className="btn-outline-navy">
                Anasayfaya Don
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
