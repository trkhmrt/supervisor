"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Check, X, Loader2, FileText, ExternalLink } from "lucide-react";
import { PhoneWhatsAppLink } from "@/components/site/PhoneWhatsAppLink";
import { formatPrice, formatDate, formatDateTimeCompact } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointments/status-labels";
import type { Appointment } from "@/lib/types";

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewReceipt, setViewReceipt] = useState<Appointment | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/appointments?limit=100", { credentials: "include" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Randevular yüklenemedi");
      }
      const data = (await res.json()) as { items: Appointment[] };
      setAppointments(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const patch = async (id: string, action: string) => {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      alert(j.error ?? "İşlem başarısız");
      return;
    }
    setViewReceipt(null);
    await reload();
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      a.superviseeName.toLowerCase().includes(q) ||
      a.supervisorName.toLowerCase().includes(q) ||
      (a.superviseePhone ?? "").includes(q) ||
      a.id.includes(q)
    );
  });

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="h2-premium text-3xl">Randevular</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Tüm sistemdeki randevular. Dekont inceleme, ödeme onayı ve iptal işlemleri buradan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending_payment">Ödeme Onayı Bekliyor</option>
            <option value="confirmed">Aktif</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
            <option value="rescheduled">Yenilendi</option>
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinical-muted" />
            <input
              placeholder="İsim veya kod ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-premium border border-clinical-border bg-white py-2 pl-10 pr-4 text-sm focus:border-navy-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yükleniyor…
        </div>
      ) : (
        <div className="overflow-hidden rounded-premium border border-clinical-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-clinical-border bg-clinical-light">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Kullanıcı / Uzman
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Telefon
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Seans Tarihi
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Oluşturulma
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Ücret
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Dekont
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Durum
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-border">
                {filtered.map((a) => {
                  const needsReceipt = a.amount > 0;
                  const canApprove =
                    !a.paymentApproved &&
                    a.status === "pending_payment" &&
                    (!needsReceipt || !!a.receiptUrl);

                  return (
                    <tr key={a.id} className="hover:bg-clinical-light/50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-navy-900">{a.superviseeName}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                          {a.supervisorName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PhoneWhatsAppLink phone={a.superviseePhone} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(a.date)} {a.startTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-clinical-muted">
                        {formatDateTimeCompact(a.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{formatPrice(a.amount)}</td>
                      <td className="px-6 py-4">
                        {needsReceipt ? (
                          a.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewReceipt(a)}
                              className="inline-flex items-center gap-1.5 rounded bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700 hover:bg-navy-100"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              İncele
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-amber-700">Bekleniyor</span>
                          )
                        ) : (
                          <span className="text-xs text-clinical-muted">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!a.paymentApproved && a.status === "pending_payment" && (
                            <button
                              type="button"
                              onClick={() => void patch(a.id, "approve_payment")}
                              disabled={!canApprove}
                              className="rounded bg-green-50 p-2 text-green-600 hover:bg-green-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                              title={
                                canApprove
                                  ? "Ödemeyi onayla"
                                  : "Dekont yüklenmeden onay verilemez"
                              }
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {a.status !== "cancelled" && a.status !== "completed" && (
                            <button
                              type="button"
                              onClick={() => void patch(a.id, "cancel")}
                              className="rounded bg-[#f1f0f0] p-2 text-black hover:bg-black hover:text-white"
                              title="İptal"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-clinical-muted">
                      Sonuç bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewReceipt?.receiptUrl && (
        <ReceiptModal
          appointment={viewReceipt}
          onClose={() => setViewReceipt(null)}
          onApprove={() => void patch(viewReceipt.id, "approve_payment")}
        />
      )}
    </>
  );
}

function ReceiptModal({
  appointment,
  onClose,
  onApprove,
}: {
  appointment: Appointment;
  onClose: () => void;
  onApprove: () => void;
}) {
  const url = appointment.receiptUrl!;
  const isPdf = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("application/pdf");
  const canApprove =
    !appointment.paymentApproved &&
    appointment.status === "pending_payment" &&
    appointment.amount > 0 &&
    !!appointment.receiptUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-premium bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-clinical-border px-6 py-4">
          <div>
            <h3 className="font-bold text-navy-900">Ödeme Dekontu</h3>
            <p className="text-xs text-clinical-muted mt-0.5">
              {appointment.superviseeName} · {formatPrice(appointment.amount)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-clinical-light">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-6">
          {isPdf ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <FileText className="h-16 w-16 text-navy-300" />
              <p className="text-sm text-clinical-muted">PDF dekont</p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="btn-navy py-2 px-4 text-xs inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                PDF&apos;i Aç
              </a>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Ödeme dekontu" className="mx-auto max-h-[50vh] rounded-premium border border-clinical-border object-contain" />
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-clinical-border px-6 py-4">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-navy py-2 px-4 text-xs inline-flex items-center gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Yeni Sekmede Aç
          </a>
          {canApprove && (
            <button type="button" onClick={onApprove} className="btn-navy py-2 px-4 text-xs">
              Ödemeyi Onayla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label =
    APPOINTMENT_STATUS_LABELS[status as keyof typeof APPOINTMENT_STATUS_LABELS] ?? status;
  const cls =
    APPOINTMENT_STATUS_COLORS[status as keyof typeof APPOINTMENT_STATUS_COLORS] ??
    "bg-clinical-light text-clinical-muted";
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${cls}`}>
      {label}
    </span>
  );
}
