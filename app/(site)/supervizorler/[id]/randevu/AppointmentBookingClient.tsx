"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { useCurrentUser } from "@/lib/store";
import type { Appointment, Service, Supervisor } from "@/lib/types";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { bookingDayStatusFromSlots } from "@/lib/calendar-booking";
import { formatDate, formatPrice } from "@/lib/utils";

type Step = "select" | "confirm" | "done";

export function AppointmentBookingClient({
  supervisor,
  service,
}: {
  supervisor: Supervisor;
  service: Service | null;
}) {
  const user = useCurrentUser();

  const [step, setStep] = useState<Step>("select");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getUTCFullYear());
  const [calMonth, setCalMonth] = useState(now.getUTCMonth() + 1);
  const [email, setEmail] = useState(user?.email ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  const groupedByDate = useMemo(() => {
    const map: Record<string, typeof supervisor.availability> = {};
    for (const slot of supervisor.availability) {
      if (slot.isBooked) continue;
      (map[slot.date] = map[slot.date] || []).push(slot);
    }
    return map;
  }, [supervisor.availability]);

  const hasBookableSlots = supervisor.availability.some((s) => !s.isBooked);

  useEffect(() => {
    const first = Object.keys(groupedByDate).sort()[0];
    if (first) setSelectedDate((prev) => prev ?? first);
  }, [groupedByDate]);

  const daySlots = selectedDate ? groupedByDate[selectedDate] ?? [] : [];
  const morningSlots = daySlots.filter((slot) => Number(slot.startTime.split(":")[0]) < 12);
  const noonSlots = daySlots.filter((slot) => Number(slot.startTime.split(":")[0]) >= 12);

  async function handleSubmit() {
    if (!selectedDate || !selectedSlot || !service) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Google Meet linki için geçerli bir e-posta girin.");
      return;
    }

    setSubmitting(true);
    setError(null);

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
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Randevu oluşturulamadı.");
        return;
      }

      setAppointment(data as Appointment);
      setStep("done");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="bg-navy-950 text-white pt-32 pb-16">
        <div className="container-wide">
          <Reveal>
            <Link
              href={`/supervizorler/${supervisor.id}`}
              className="inline-flex items-center gap-2 text-navy-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              {supervisor.fullName}
            </Link>
          </Reveal>
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <Reveal delay={0.05}>
                <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">
                  Randevu Oluştur
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  {supervisor.fullName} ile seans planlayın
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-navy-200 max-w-xl leading-relaxed">
                  Takvimden gün ve saat seçin. Onay sonrası Google Meet bağlantısı{" "}
                  <strong className="text-white">e-posta adresinize</strong> gönderilir.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2} className="lg:col-span-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-premium p-4">
                <div className="relative h-16 w-16 rounded-premium overflow-hidden shrink-0">
                  <Image
                    src={supervisor.photo}
                    alt={supervisor.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">{supervisor.fullName}</div>
                  <div className="text-sm text-navy-300">{supervisor.title}</div>
                  {service && (
                    <div className="text-sm text-navy-400 mt-1">{service.name}</div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16 bg-clinical-light">
        <div className="container-wide">
          <div className="max-w-xl mx-auto">
            {!service ? (
              <div className="card-premium p-8 text-center text-clinical-muted">
                Randevu için aktif bir hizmet bulunamadı.
              </div>
            ) : (
              <div className="card-premium card-flat-hover bg-white p-6 sm:p-8 shadow-none">
                <AnimatePresence mode="wait">
                  {step === "select" && (
                    <motion.div
                      key="select"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      <h2 className="font-display text-3xl font-bold text-navy-900">
                        Tarih ve saat
                      </h2>

                      {!hasBookableSlots ? (
                        <p className="text-clinical-muted text-sm py-6 text-center">
                          Şu an müsait randevu saati yok. Lütfen daha sonra tekrar deneyin.
                        </p>
                      ) : (
                        <>
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

                          <div>
                            <h3 className="font-display text-2xl font-bold text-navy-900 mb-4">
                              Saat
                            </h3>
                            <SlotGroup
                              label="Sabah"
                              slots={morningSlots}
                              selectedStart={selectedSlot?.start}
                              onSelect={(start, end) => setSelectedSlot({ start, end })}
                            />
                            <SlotGroup
                              label="Öğleden sonra"
                              slots={noonSlots}
                              selectedStart={selectedSlot?.start}
                              onSelect={(start, end) => setSelectedSlot({ start, end })}
                            />
                            {daySlots.length === 0 && (
                              <p className="text-sm text-clinical-muted rounded-xl border border-clinical-border p-4">
                                Bu günde uygun saat yok.
                              </p>
                            )}
                          </div>

                          <div className="border-t border-clinical-border pt-6">
                            <div className="mb-4 flex items-center gap-2 text-sm text-clinical-muted">
                              <CalendarDays className="h-4 w-4" />
                              Seçilen:{" "}
                              <span className="font-bold text-navy-900">
                                {selectedDate ? formatDate(selectedDate) : "—"}{" "}
                                {selectedSlot?.start ?? ""}
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={!selectedDate || !selectedSlot}
                              onClick={() => setStep("confirm")}
                              className="btn-navy w-full py-4"
                            >
                              Devam Et
                            </button>
                          </div>
                        </>
                      )}
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
                        className="flex items-center gap-2 text-xs font-bold text-navy-500 hover:text-navy-900"
                      >
                        <ChevronLeft className="h-4 w-4" /> Geri
                      </button>

                      <div className="space-y-4 rounded-premium border border-clinical-border bg-clinical-light p-6 text-sm">
                        <Row label="Uzman" value={supervisor.fullName} />
                        <Row label="Hizmet" value={service.name} />
                        <Row
                          label="Tarih & saat"
                          value={`${selectedDate ? formatDate(selectedDate!) : ""} • ${selectedSlot?.start}`}
                        />
                        <Row
                          label="Ücret"
                          value={formatPrice(supervisor.pricePerSession, supervisor.currency)}
                        />
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
                            <Mail className="h-3.5 w-3.5" />
                            E-posta (Google Meet linki buraya gider) *
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm focus:border-navy-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
                            <User className="h-3.5 w-3.5" />
                            Ad soyad
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Adınız Soyadınız"
                            className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm focus:border-navy-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-navy-500">
                            Not (opsiyonel)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-premium border border-clinical-border px-4 py-3 text-sm focus:border-navy-400 focus:outline-none"
                            placeholder="Süpervizöre iletmek istediğiniz kısa bir not..."
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium px-4 py-3">
                          {error}
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSubmit}
                        className="btn-navy w-full py-4 disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Kaydediliyor…
                          </>
                        ) : (
                          "Randevuyu Oluştur"
                        )}
                      </button>
                    </motion.div>
                  )}

                  {step === "done" && appointment && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 text-center"
                    >
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Check className="h-10 w-10" />
                      </div>
                      <h2 className="h2-premium mb-3">Randevunuz kaydedildi</h2>
                      <p className="text-clinical-muted mb-8 max-w-sm mx-auto">
                        Ödeme onayı sonrası Google Meet bağlantısı{" "}
                        <strong className="text-navy-900">{appointment.superviseeEmail}</strong>{" "}
                        adresine gönderilecektir.
                      </p>
                      <div className="mb-8 rounded-premium border border-clinical-border bg-clinical-light p-5 text-left text-sm space-y-2">
                        <div>
                          <span className="text-clinical-muted">Randevu kodu: </span>
                          <span className="font-mono font-bold">{appointment.id}</span>
                        </div>
                        <motion.div>
                          <span className="text-clinical-muted">Tarih: </span>
                          <span className="font-bold">
                            {formatDate(appointment.date)} • {appointment.startTime}
                          </span>
                        </motion.div>
                      </div>
                      <motion.div className="flex flex-wrap justify-center gap-3">
                        <Link href="/dashboard" className="btn-navy">
                          Panelim
                        </Link>
                        <Link href={`/supervizorler/${supervisor.id}`} className="btn-outline-navy">
                          Profile Dön
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-clinical-border pb-3 last:border-0 last:pb-0">
      <span className="text-clinical-muted">{label}</span>
      <span className="font-bold text-navy-900 text-right">{value}</span>
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  selectedStart,
  onSelect,
}: {
  label: string;
  slots: Supervisor["availability"];
  selectedStart?: string;
  onSelect: (start: string, end: string) => void;
}) {
  if (!slots.length) return null;
  return (
    <div className="mb-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-clinical-muted">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slots.map((slot) => {
          const isSelected = selectedStart === slot.startTime;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect(slot.startTime, slot.endTime)}
              className={`rounded-2xl px-4 py-3 text-lg font-bold transition ${
                isSelected
                  ? "bg-navy-900 text-white"
                  : "border border-clinical-border bg-white text-navy-900 hover:border-navy-300"
              }`}
            >
              {slot.startTime}
            </button>
          );
        })}
      </div>
    </div>
  );
}
