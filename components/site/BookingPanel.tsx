"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  Mail,
} from "lucide-react";
import type { Appointment } from "@/lib/types";
import { useCurrentUser } from "@/lib/store";
import type { Service, Supervisor } from "@/lib/types";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { bookingDayStatusFromSlots } from "@/lib/calendar-booking";
import { formatPrice } from "@/lib/utils";

export function BookingPanel({
  supervisorId,
  serviceType = "individual",
  supervisor: supervisorOverride,
  service: serviceOverride,
}: {
  supervisorId: string;
  serviceType?: string;
  supervisor?: Supervisor | null;
  service?: Service | null;
}) {
  const user = useCurrentUser();

  const [supervisor, setSupervisor] = useState<Supervisor | null>(supervisorOverride ?? null);
  const [services, setServices] = useState<Service[]>([]);
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    if (supervisorOverride) {
      setSupervisor(supervisorOverride);
      return;
    }
    let cancelled = false;
    fetch(`/api/supervisors/${supervisorId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Supervisor) => {
        if (!cancelled) setSupervisor(data);
      })
      .catch(() => {
        if (!cancelled) setSupervisor(null);
      });
    return () => {
      cancelled = true;
    };
  }, [supervisorId, supervisorOverride]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list: Service[]) => {
        if (!cancelled) setServices(list);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setRemoteReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getUTCFullYear());
  const [calMonth, setCalMonth] = useState(now.getUTCMonth() + 1);

  const service =
    serviceOverride ??
    services.find((s) => s.id === serviceType) ??
    services.find((s) => s.slug === serviceType);

  const groupedByDate = useMemo(() => {
    if (!supervisor) return {};
    const map: Record<string, typeof supervisor.availability> = {};

    for (const slot of supervisor.availability) {
      if (slot.isBooked) continue;
      (map[slot.date] = map[slot.date] || []).push(slot);
    }

    return map;
  }, [supervisor]);

  const hasBookableSlots = supervisor?.availability.some((s) => !s.isBooked) ?? false;

  useEffect(() => {
    const first = Object.keys(groupedByDate).sort()[0];
    if (first) setSelectedDate((prev) => prev ?? first);
  }, [groupedByDate]);

  if (!remoteReady && !supervisorOverride) {
    return (
      <p className="text-center text-sm text-clinical-muted py-8">Randevu bilgileri yükleniyor…</p>
    );
  }
  if (!supervisor || !service) return null;

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

              <MonthCalendarGrid
                year={calYear}
                month={calMonth}
                selectedDate={selectedDate}
                legend
                getStatus={(date) =>
                  bookingDayStatusFromSlots(date, supervisor.availability)
                }
                onMonthChange={(y, m) => {
                  setCalYear(y);
                  setCalMonth(m);
                }}
                onDayClick={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
              />
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

            <div className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
                  <Mail className="h-3.5 w-3.5" />
                  E-posta (Google Meet linki) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full rounded-premium border border-clinical-border bg-white px-4 py-3 text-sm focus:border-navy-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-navy-500">
                  Ad soyad
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="w-full rounded-premium border border-clinical-border bg-white px-4 py-3 text-sm focus:border-navy-400 focus:outline-none"
                />
              </div>
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
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  const trimmedEmail = email.trim().toLowerCase();
                  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
                    setSubmitError("Geçerli bir e-posta girin.");
                    return;
                  }
                  setSubmitting(true);
                  setSubmitError(null);
                  try {
                    const res = await fetch("/api/appointments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        supervisorId: supervisor.id,
                        superviseeEmail: trimmedEmail,
                        superviseeName: fullName.trim() || trimmedEmail.split("@")[0],
                        userId: user?.id,
                        serviceType: service.id,
                        date: selectedDate,
                        startTime: selectedSlot!.start,
                        endTime: selectedSlot!.end,
                        notes: notes.trim() || undefined,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setSubmitError(data.error ?? "Randevu oluşturulamadı.");
                      return;
                    }
                    setAppointment(data);
                    setStep("done");
                  } catch {
                    setSubmitError("Bağlantı hatası.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="btn-navy w-full py-4 text-base disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Kaydediliyor…
                  </>
                ) : (
                  <>
                    Randevuyu Onayla
                    <CreditCard className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === "done" && appointment && (
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
              <div className="font-mono font-bold text-navy-900">{appointment.id}</div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="btn-navy">
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
