"use client";

import Link from "next/link";
import { Calendar, Clock, Video } from "lucide-react";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { Appointment, Service } from "@/lib/types";
import { formatPrice, formatDate, serviceLabelById } from "@/lib/utils";
import { useRemoteServices } from "@/hooks/useRemoteServices";

export default function PanelAppointmentsPage() {
  const user = useCurrentUser()!;
  const { data: servicesForLabels } = useRemoteServices();

  const appointments = useAppStore((s) =>
    s.appointments
      .filter((a) =>
        user.role === "supervisor"
          ? a.supervisorName === user.fullName
          : a.superviseeId === user.id
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  );

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed"
  );
  const past = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Randevularım</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Yaklaşan ve geçmiş seanslarınız.
          </p>
        </div>
        {user.role !== "supervisor" && (
          <Link href="/supervizorler" className="btn-navy py-2 px-6 text-xs">
            + Yeni Randevu Al
          </Link>
        )}
      </div>

      <div className="mb-12">
        <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-navy-900">
          Yaklaşan ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="card-premium border-dashed bg-clinical-light py-16 text-center">
            <p className="mb-6 text-sm text-clinical-muted">Planlanmış randevu yok.</p>
            {user.role !== "supervisor" && (
              <Link href="/supervizorler" className="btn-navy">
                Süpervizörleri İncele
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((a) => (
              <AppointmentRow
                key={a.id}
                appointment={a}
                userRole={user.role}
                servicesForLabels={servicesForLabels}
              />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-navy-900">
            Geçmiş ({past.length})
          </h2>
          <div className="space-y-4 opacity-80">
            {past.map((a) => (
              <AppointmentRow
                key={a.id}
                appointment={a}
                userRole={user.role}
                servicesForLabels={servicesForLabels}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function AppointmentRow({
  appointment,
  userRole,
  servicesForLabels,
}: {
  appointment: Appointment;
  userRole: string;
  servicesForLabels: Service[];
}) {
  const cancel = useAppStore((s) => s.cancelAppointment);

  const statusLabel: Record<string, string> = {
    pending_payment: "Ödeme Bekliyor",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
    rescheduled: "Yeniden Planlandı",
  };

  const statusColor: Record<string, string> = {
    pending_payment: "bg-amber-50 text-amber-700 border-amber-100",
    confirmed: "bg-green-50 text-green-700 border-green-100",
    completed: "bg-navy-50 text-navy-700 border-navy-100",
    cancelled: "border-black/15 bg-[#f1f0f0] text-black",
    rescheduled: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="card-premium flex flex-col justify-between gap-6 md:flex-row md:items-center hover:border-navy-900">
      <div className="flex-1">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColor[appointment.status]}`}
          >
            {statusLabel[appointment.status]}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
            {serviceLabelById(servicesForLabels, appointment.serviceType)}
          </span>
        </div>
        <h4 className="mb-2 text-lg font-bold text-navy-900">
          {userRole === "supervisor" ? appointment.superviseeName : appointment.supervisorName}
        </h4>
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-clinical-muted">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-navy-400" />
            {formatDate(appointment.date)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-navy-400" />
            {appointment.startTime} - {appointment.endTime}
          </span>
          <span className="text-navy-900">{formatPrice(appointment.amount)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {appointment.meetLink && appointment.status === "confirmed" && (
          <a
            href={appointment.meetLink}
            target="_blank"
            rel="noreferrer"
            className="btn-navy py-2 px-5 text-xs"
          >
            <Video className="h-4 w-4" /> Meet&apos;e Katıl
          </a>
        )}
        {(appointment.status === "pending_payment" || appointment.status === "confirmed") && (
          <button
            type="button"
            onClick={() => cancel(appointment.id)}
            className="btn-outline-navy py-2 px-5 text-xs"
          >
            İptal Et
          </button>
        )}
      </div>
    </div>
  );
}
