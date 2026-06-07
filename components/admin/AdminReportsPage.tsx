"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  GraduationCap,
  Loader2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { hasUserScope } from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { formatPrice } from "@/lib/utils";
import type { AdminReport } from "@/lib/db/reports";
import type { Supervisor } from "@/lib/types";

function defaultFromDate(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 3);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AdminReportsPage() {
  const user = useSessionUser()!;
  const canView = user.role === "admin" && hasUserScope(user, "appointments:list");

  const [from, setFrom] = useState(defaultFromDate);
  const [to, setTo] = useState(todayIso);
  const [supervisorId, setSupervisorId] = useState("");
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/adminpanel/supervisors", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSupervisors(Array.isArray(data) ? data : []))
      .catch(() => setSupervisors([]));
  }, []);

  const load = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (supervisorId) params.set("supervisorId", supervisorId);

      const res = await fetch(`/api/admin/reports?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rapor yüklenemedi");
      setReport(data as AdminReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rapor yüklenemedi");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [canView, from, to, supervisorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxMonthlyRevenue = useMemo(
    () => Math.max(1, ...(report?.monthlyRevenue.map((m) => m.revenue) ?? [1])),
    [report]
  );

  if (!canView) {
    return (
      <p className="text-sm text-clinical-muted">
        Raporları görüntülemek için randevu listeleme yetkisi gerekir.
      </p>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Raporlar</h1>
        <p className="mt-2 max-w-3xl text-sm text-clinical-muted">
          Süpervizör, hizmet ve eğitim performansı. Randevu geliri, ödeme onaylanmış tutarlar
          üzerinden hesaplanır. Eğitim başvuruları sayısal olarak raporlanır (eğitim ücreti
          sistemde ayrı takip edilmez).
        </p>
      </div>

      <div className="mb-8 card-premium flex flex-wrap items-end gap-4 !p-5">
        <label className="min-w-[140px]">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
            Başlangıç
          </span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
          />
        </label>
        <label className="min-w-[140px]">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
            Bitiş
          </span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
          />
        </label>
        <label className="min-w-[200px] flex-1">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
            Süpervizör
          </span>
          <select
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
          >
            <option value="">Tümü</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => void load()} className="btn-navy py-2 px-6 text-xs">
          Uygula
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-20 text-sm text-clinical-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Rapor hazırlanıyor…
        </div>
      ) : report ? (
        <div className="space-y-10">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Wallet}
              label="Onaylı gelir"
              value={formatPrice(report.totals.collectedRevenue)}
              hint={`${report.totals.paidAppointmentCount} ödemeli randevu`}
            />
            <KpiCard
              icon={TrendingUp}
              label="Bekleyen ödeme"
              value={formatPrice(report.totals.pendingRevenue)}
              hint={`${report.totals.pendingPaymentCount} randevu`}
            />
            <KpiCard
              icon={Calendar}
              label="Randevular"
              value={String(report.totals.appointmentCount)}
              hint={`${report.totals.completedCount} tamamlandı · ${report.totals.cancelledCount} iptal`}
            />
            <KpiCard
              icon={GraduationCap}
              label="Eğitim başvurusu"
              value={String(report.totals.courseEnrollmentTotal)}
              hint={`${report.totals.courseEnrollmentApproved} onaylı · ${report.totals.courseEnrollmentPending} bekleyen`}
            />
          </section>

          {report.monthlyRevenue.length > 0 && (
            <section className="card-premium">
              <h2 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-navy-900">
                <BarChart3 className="h-4 w-4" />
                Aylık onaylı gelir
              </h2>
              <div className="space-y-3">
                {report.monthlyRevenue.map((m) => (
                  <div key={m.month}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-navy-900">{m.label}</span>
                      <span className="text-clinical-muted">
                        {formatPrice(m.revenue)} · {m.appointmentCount} randevu
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-clinical-light">
                      <div
                        className="h-full rounded-full bg-navy-900 transition-all"
                        style={{ width: `${Math.round((m.revenue / maxMonthlyRevenue) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <ReportTable
            title="Süpervizör bazında"
            icon={Users}
            empty="Seçilen dönemde süpervizör verisi yok."
            headers={[
              "Süpervizör",
              "Onaylı gelir",
              "Bekleyen",
              "Randevu",
              "Tamamlanan",
              "Eğitim",
              "Başvuru (onay)",
            ]}
            rows={report.bySupervisor.map((r) => [
              <Link
                key={r.supervisorId}
                href={`/dashboard/supervizorler/${r.supervisorId}`}
                className="font-semibold text-navy-900 hover:underline"
              >
                {r.supervisorName}
              </Link>,
              formatPrice(r.collectedRevenue),
              formatPrice(r.pendingRevenue),
              String(r.appointmentCount),
              String(r.completedCount),
              String(r.courseCount),
              String(r.enrollmentApproved),
            ])}
          />

          <ReportTable
            title="Eğitim bazında"
            icon={GraduationCap}
            empty="Eğitim kaydı yok."
            headers={[
              "Eğitim",
              "Süpervizör",
              "Onaylı",
              "Bekleyen",
              "Red",
              "Toplam",
              "Durum",
            ]}
            rows={report.byCourse.map((r) => [
              <Link
                key={r.courseId}
                href={`/dashboard/kurslar/${r.courseId}`}
                className="font-semibold text-navy-900 hover:underline"
              >
                {r.courseTitle}
              </Link>,
              r.supervisorName,
              String(r.enrollmentApproved),
              String(r.enrollmentPending),
              String(r.enrollmentRejected),
              String(r.enrollmentTotal),
              r.active ? (
                <span className="text-green-700">Aktif</span>
              ) : (
                <span className="text-clinical-muted">Pasif</span>
              ),
            ])}
          />

          <ReportTable
            title="Hizmet bazında (randevu geliri)"
            icon={Calendar}
            empty="Randevu kaydı yok."
            headers={["Hizmet", "Onaylı gelir", "Bekleyen", "Randevu"]}
            rows={report.byService.map((r) => [
              r.serviceName,
              formatPrice(r.collectedRevenue),
              formatPrice(r.pendingRevenue),
              String(r.appointmentCount),
            ])}
          />

          <p className="text-xs text-clinical-muted">
            Yeni üye kaydı (dönem): {report.totals.newMemberCount} · Gelir = ödeme onaylı ve
            iptal edilmemiş randevu tutarları toplamı.
          </p>
        </div>
      ) : null}
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card-premium !p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
      <p className="mt-1 text-xs text-clinical-muted">{hint}</p>
    </div>
  );
}

function ReportTable({
  title,
  icon: Icon,
  headers,
  rows,
  empty,
}: {
  title: string;
  icon: typeof Wallet;
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <section className="card-premium overflow-hidden !p-0">
      <div className="border-b border-clinical-border px-6 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-navy-900">
          <Icon className="h-4 w-4" />
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-clinical-border bg-clinical-light">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-clinical-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-clinical-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-10 text-center text-clinical-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((cells, i) => (
                <tr key={i} className="hover:bg-clinical-light/50">
                  {cells.map((cell, j) => (
                    <td key={j} className="px-6 py-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
