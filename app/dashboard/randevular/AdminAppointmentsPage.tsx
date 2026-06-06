"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Check, X, Loader2 } from "lucide-react";
import { PhoneWhatsAppLink } from "@/components/site/PhoneWhatsAppLink";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

export function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
            Tüm sistemdeki randevular. Ödeme onayı / iptal işlemleri buradan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending_payment">Ödeme Bekliyor</option>
            <option value="confirmed">Onaylı</option>
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
                    Tarih
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Ücret
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
                {filtered.map((a) => (
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
                    <td className="px-6 py-4 text-sm font-bold">{formatPrice(a.amount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!a.paymentApproved && a.status === "pending_payment" && (
                          <button
                            type="button"
                            onClick={() => void patch(a.id, "approve_payment")}
                            className="rounded bg-green-50 p-2 text-green-600 hover:bg-green-600 hover:text-white"
                            title="Ödemeyi onayla"
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
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-clinical-muted">
                      Sonuç bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_payment: { label: "Ödeme Bekliyor", cls: "bg-amber-50 text-amber-700 border-amber-100" },
    confirmed: { label: "Onaylı", cls: "bg-green-50 text-green-700 border-green-100" },
    completed: { label: "Tamamlandı", cls: "bg-navy-50 text-navy-700 border-navy-100" },
    cancelled: { label: "İptal", cls: "border-black/15 bg-[#f1f0f0] text-black" },
    rescheduled: { label: "Yenilendi", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  };
  const s = map[status] ?? { label: status, cls: "bg-clinical-light text-clinical-muted" };
  return (
    <span className={`inline-block rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${s.cls}`}>
      {s.label}
    </span>
  );
}
