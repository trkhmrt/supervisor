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
  Loader2,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { useCurrentUser } from "@/lib/store";
import type { Appointment, Service, ServiceGroupWithStats, Supervisor } from "@/lib/types";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { bookingDayStatusFromSlots } from "@/lib/calendar-booking";
import { formatDate, formatPrice } from "@/lib/utils";
import { isValidPhone, normalizePhone } from "@/lib/validation/phone";

type Step = "select" | "confirm" | "done";

export function AppointmentBookingClient({
  supervisor,
  service,
}: {
  supervisor: Supervisor;
  service: Service | null;
}) {
  const user = useCurrentUser();
  const isGroupService = service?.isGroupService ?? false;

  const [step, setStep] = useState<Step>("select");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ServiceGroupWithStats | null>(null);
  const [groups, setGroups] = useState<ServiceGroupWithStats[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getUTCFullYear());
  const [calMonth, setCalMonth] = useState(now.getUTCMonth() + 1);
  const [email, setEmail] = useState(user?.email ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
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
  const hasAvailableGroup = groups.some((g) => !g.isFull);

  useEffect(() => {
    if (!isGroupService || !service) {
      setGroups([]);
      return;
    }

    let cancelled = false;
    setGroupsLoading(true);
    fetch(`/api/supervisors/${supervisor.id}/service-groups?serviceId=${service.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setGroups(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      })
      .finally(() => {
        if (!cancelled) setGroupsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isGroupService, service, supervisor.id]);

  useEffect(() => {
    if (user) {
      setEmail((prev) => prev || user.email);
      setFullName((prev) => prev || user.fullName);
      setPhone((prev) => prev || user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    const first = Object.keys(groupedByDate).sort()[0];
    if (first && !isGroupService) setSelectedDate((prev) => prev ?? first);
  }, [groupedByDate, isGroupService]);

  const daySlots = selectedDate ? groupedByDate[selectedDate] ?? [] : [];
  const morningSlots = daySlots.filter((slot) => Number(slot.startTime.split(":")[0]) < 12);
  const noonSlots = daySlots.filter((slot) => Number(slot.startTime.split(":")[0]) >= 12);

  async function handleSubmit() {
    if (!service) return;
    if (isGroupService && !selectedGroup) return;
    if (!isGroupService && (!selectedDate || !selectedSlot)) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Google Meet linki için geçerli bir e-posta girin.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        supervisorId: supervisor.id,
        superviseeEmail: trimmedEmail,
        superviseeName: fullName.trim() || trimmedEmail.split("@")[0],
        superviseePhone: normalizePhone(phone),
        userId: user?.id,
        serviceType: service.id,
        notes: notes.trim() || undefined,
      };

      if (isGroupService) {
        payload.serviceGroupId = selectedGroup!.id;
      } else {
        payload.date = selectedDate;
        payload.startTime = selectedSlot!.start;
        payload.endTime = selectedSlot!.end;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const canContinue = isGroupService
    ? !!selectedGroup && !selectedGroup.isFull
    : !!selectedDate && !!selectedSlot;

  return (
    <>
      <section className="bg-navy-950 text-white pt-site-hero pb-16">
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
                  {isGroupService ? "Gruba Başvur" : "Randevu Oluştur"}
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  {isGroupService
                    ? `${supervisor.fullName} — grup seçimi`
                    : `${supervisor.fullName} ile seans planlayın`}
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-4 text-navy-200 max-w-xl leading-relaxed">
                  {isGroupService ? (
                    <>
                      Uygun grubu seçin. Onay sonrası gruba kaydınız tamamlanır ve Google Meet
                      bağlantısı{" "}
                      <strong className="text-white">e-posta adresinize</strong> gönderilir.
                    </>
                  ) : (
                    <>
                      Takvimden gün ve saat seçin. Onay sonrası Google Meet bağlantısı{" "}
                      <strong className="text-white">e-posta adresinize</strong> gönderilir.
                    </>
                  )}
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
                        {isGroupService ? "Grup seçimi" : "Tarih ve saat"}
                      </h2>

                      {isGroupService ? (
                        <GroupPicker
                          groups={groups}
                          loading={groupsLoading}
                          selectedId={selectedGroup?.id}
                          onSelect={setSelectedGroup}
                        />
                      ) : !hasBookableSlots ? (
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
                          </div>
                        </>
                      )}

                      {(isGroupService ? hasAvailableGroup || groupsLoading : hasBookableSlots) && (
                        <button
                          type="button"
                          disabled={!canContinue || groupsLoading}
                          onClick={() => setStep("confirm")}
                          className="btn-navy w-full py-4 disabled:opacity-60"
                        >
                          Devam Et
                        </button>
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
                        {isGroupService && selectedGroup ? (
                          <>
                            <Row label="Grup" value={selectedGroup.name} />
                            <Row
                              label="Kapasite"
                              value={`${selectedGroup.enrolledCount}/${selectedGroup.capacity} kişi${
                                selectedGroup.seatLabel ? ` (${selectedGroup.seatLabel})` : ""
                              }`}
                            />
                          </>
                        ) : (
                          <Row
                            label="Tarih & saat"
                            value={`${selectedDate ? formatDate(selectedDate!) : ""} • ${selectedSlot?.start}`}
                          />
                        )}
                        <Row
                          label="Ücret"
                          value={
                            supervisor.sessionFeeOnRequest
                              ? "Seans ücreti görüşme esnasında belirtilecektir."
                              : formatPrice(service.price || supervisor.pricePerSession, supervisor.currency)
                          }
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
                            <Phone className="h-3.5 w-3.5" />
                            Telefon *
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="05XX XXX XX XX"
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
                        ) : isGroupService ? (
                          "Gruba Başvur"
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
                      <h2 className="h2-premium mb-3">
                        {isGroupService ? "Gruba kaydınız alındı" : "Randevunuz kaydedildi"}
                      </h2>
                      <p className="text-clinical-muted mb-8 max-w-sm mx-auto">
                        Ödeme onayı sonrası Google Meet bağlantısı{" "}
                        <strong className="text-navy-900">{appointment.superviseeEmail}</strong>{" "}
                        adresine gönderilecektir.
                      </p>
                      <div className="mb-8 rounded-premium border border-clinical-border bg-clinical-light p-5 text-left text-sm space-y-2">
                        <div>
                          <span className="text-clinical-muted">Kayıt kodu: </span>
                          <span className="font-mono font-bold">{appointment.id}</span>
                        </div>
                        {appointment.serviceGroupName && (
                          <div>
                            <span className="text-clinical-muted">Grup: </span>
                            <span className="font-bold">{appointment.serviceGroupName}</span>
                          </div>
                        )}
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

function GroupPicker({
  groups,
  loading,
  selectedId,
  onSelect,
}: {
  groups: ServiceGroupWithStats[];
  loading: boolean;
  selectedId?: string;
  onSelect: (group: ServiceGroupWithStats) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (!groups.length) {
    return (
      <p className="text-clinical-muted text-sm py-6 text-center rounded-xl border border-clinical-border p-6">
        Bu hizmet için henüz açık grup yok. Lütfen daha sonra tekrar deneyin.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isSelected = selectedId === group.id;
        const disabled = group.isFull;
        return (
          <button
            key={group.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(group)}
            className={`w-full rounded-premium border p-4 text-left transition ${
              disabled
                ? "border-clinical-border bg-clinical-light opacity-60 cursor-not-allowed"
                : isSelected
                  ? "border-navy-900 bg-navy-50 ring-2 ring-navy-900"
                  : "border-clinical-border bg-white hover:border-navy-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-navy-600" />
                  <span className="font-bold text-navy-900">{group.name}</span>
                  {group.seatLabel && (
                    <span className="text-xs text-clinical-muted">({group.seatLabel})</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-clinical-muted">
                  {group.enrolledCount}/{group.capacity} kişi kayıtlı
                  {group.remainingSeats > 0 && ` · ${group.remainingSeats} boş yer`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  group.isFull
                    ? "bg-red-50 text-red-700"
                    : isSelected
                      ? "bg-navy-900 text-white"
                      : "bg-green-50 text-green-700"
                }`}
              >
                {group.isFull ? "Dolu" : isSelected ? "Seçildi" : "Müsait"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
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
