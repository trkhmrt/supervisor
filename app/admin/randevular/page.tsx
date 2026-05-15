"use client";

import { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  Check,
  X,
  Clock,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/utils";

export default function AdminAppointments() {
  const appointments = useAppStore((s) => s.appointments);
  const approvePayment = useAppStore((s) => s.approvePayment);
  const cancelAppointment = useAppStore((s) => s.cancelAppointment);
  const [query, setQuery] = useState("");

  const filtered = appointments.filter(
    (a) =>
      a.superviseeName.toLowerCase().includes(query.toLowerCase()) ||
      a.supervisorName.toLowerCase().includes(query.toLowerCase()) ||
      a.id.includes(query)
  );

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
         <h1 className="h2-premium text-3xl">Randevular</h1>
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-muted" />
               <input
                 placeholder="İsim veya kod ara..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="bg-white border border-clinical-border rounded-premium pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-navy-900 w-64"
               />
            </div>
            <button className="btn-outline-navy py-2 px-4 text-xs">
               <Filter className="h-4 w-4" /> Filtrele
            </button>
         </div>
      </div>

      <div className="bg-white rounded-premium border border-clinical-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clinical-light border-b border-clinical-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Kullanıcı / Uzman</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Tarih & Saat</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Hizmet</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Ücret</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Durum</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-clinical-light/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-navy-900">{a.superviseeName}</div>
                    <div className="text-[10px] text-clinical-muted font-bold uppercase tracking-widest mt-1">{a.supervisorName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-navy-900">{formatDate(a.date)}</div>
                    <div className="text-xs text-clinical-muted mt-1">{a.startTime} - {a.endTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-navy-700 bg-navy-50 px-2 py-1 rounded">
                      {a.serviceType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-navy-900">{formatPrice(a.amount)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!a.paymentApproved && a.status === "pending_payment" && (
                        <button
                          onClick={() => approvePayment(a.id)}
                          className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-600 hover:text-white transition-all"
                          title="Ödemeyi Onayla"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {a.status !== "cancelled" && (
                        <button
                          onClick={() => cancelAppointment(a.id)}
                          className="rounded bg-[#f1f0f0] p-2 text-black transition-all hover:bg-black hover:text-white"
                          title="İptal Et"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-clinical-muted hover:text-navy-900">
                         <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    pending_payment: { label: "Ödeme Bekliyor", cls: "bg-amber-50 text-amber-700 border-amber-100" },
    confirmed: { label: "Onaylı", cls: "bg-green-50 text-green-700 border-green-100" },
    completed: { label: "Tamamlandı", cls: "bg-navy-50 text-navy-700 border-navy-100" },
    cancelled: { label: "İptal Edildi", cls: "border-black/15 bg-[#f1f0f0] text-black" },
  };
  const s = map[status] ?? { label: status, cls: "bg-clinical-light text-clinical-muted border-clinical-border" };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${s.cls}`}>
      {s.label}
    </span>
  );
}
