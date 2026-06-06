"use client";

import Link from "next/link";
import { Calendar, Clock, Loader2, Video } from "lucide-react";
import { PhoneWhatsAppLink } from "@/components/site/PhoneWhatsAppLink";
import { useSessionUser } from "@/hooks/useSessionUser";
import { usePanelAppointments } from "@/hooks/usePanelAppointments";
import type { Appointment, Service } from "@/lib/types";
import { formatPrice, formatDate, serviceLabelById } from "@/lib/utils";
import { useRemoteServices } from "@/hooks/useRemoteServices";
import { AdminAppointmentsPage } from "./AdminAppointmentsPage";

export default function PanelAppointmentsPage() {
  const user = useSessionUser()!;
  if (user.role === "admin") {
    return <AdminAppointmentsPage />;
  }
  return <PanelAppointmentsView />;
}

function PanelAppointmentsView() {
  const user = useSessionUser()!;
  const { data: servicesForLabels } = useRemoteServices();
  const { appointments, loading, loadingMore, hasMore, error, loadMore, cancelAppointment } =
    usePanelAppointments(user);

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
            Yaklaşan ve geçmiş seanslarınız (veritabanından).
          </p>
        </div>
        {user.role !== "supervisor" && (
          <Link href="/supervizorler" className="btn-navy py-2 px-6 text-xs">
            + Yeni Randevu Al
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-8 flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Randevular yükleniyor…
        </div>
      )}

      <div className="mb-12">
        <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-navy-900">
          Yaklaşan ({upcoming.length})
        </h2>
        {!loading && upcoming.length === 0 ? (
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
                onCancel={cancelAppointment}
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
                onCancel={cancelAppointment}
              />
            ))}
          </div>
        </div>
      )}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="btn-outline-navy px-8 py-2 text-xs disabled:opacity-50"
          >
            {loadingMore ? "Yükleniyor…" : "Daha fazla yükle"}
          </button>
        </div>
      )}
    </>
  );
}

function AppointmentRow({
  appointment,
  userRole,
  servicesForLabels,
  onCancel,
}: {
  appointment: Appointment;
  userRole: string;
  servicesForLabels: Service[];
  onCancel: (id: string) => Promise<boolean>;
}) {
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
        {userRole === "supervisor" && (
          <div className="mb-3">
            <PhoneWhatsAppLink phone={appointment.superviseePhone} compact />
          </div>
        )}
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
            onClick={() => void onCancel(appointment.id)}
            className="btn-outline-navy py-2 px-5 text-xs"
          >
            İptal Et
          </button>
        )}
      </div>
    </div>
  );
}
