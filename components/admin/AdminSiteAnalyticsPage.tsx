"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Globe,
  Loader2,
  Monitor,
  Smartphone,
  Users,
} from "lucide-react";
import { hasUserScope } from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { formatDateTimeCompact } from "@/lib/utils";
import type { SiteAnalytics } from "@/lib/db/analytics";

function defaultFromDate(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Smartphone,
};

export function AdminSiteAnalyticsPage() {
  const user = useSessionUser()!;
  const canView = user.role === "admin" && hasUserScope(user, "settings:read");

  const [from, setFrom] = useState(defaultFromDate);
  const [to, setTo] = useState(todayIso);
  const [pathFilter, setPathFilter] = useState("");
  const [data, setData] = useState<SiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const load = useCallback(async () => {
    if (!canView) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (pathFilter.trim()) params.set("path", pathFilter.trim());
      params.set("limit", String(pageSize));
      params.set("offset", String(page * pageSize));

      const res = await fetch(`/api/admin/analytics?${params}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analiz yüklenemedi");
      setData(json as SiteAnalytics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analiz yüklenemedi");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [canView, from, to, pathFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxDaily = useMemo(
    () => Math.max(1, ...(data?.dailyViews.map((d) => d.count) ?? [1])),
    [data]
  );

  const totalPages = data ? Math.ceil(data.recentTotal / pageSize) : 0;

  if (!canView) {
    return (
      <p className="text-sm text-clinical-muted">
        Site analizini görüntülemek için site ayarları okuma yetkisi gerekir.
      </p>
    );
  }

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Site Analizi</h1>
        <p className="mt-2 max-w-3xl text-sm text-clinical-muted">
          Ziyaret edilen sayfalar, IP adresleri, cihaz ve tarayıcı bilgileri. Veriler yalnızca
          public site sayfalarından toplanır; admin paneli izlenmez.
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
            onChange={(e) => {
              setPage(0);
              setFrom(e.target.value);
            }}
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
            onChange={(e) => {
              setPage(0);
              setTo(e.target.value);
            }}
            className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
          />
        </label>
        <label className="min-w-[200px] flex-1">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
            URL filtresi
          </span>
          <input
            type="text"
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            placeholder="/supervizorler, /egitimler…"
            className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setPage(0);
            void load();
          }}
          className="btn-navy py-2 px-6 text-xs"
        >
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
          Analiz hazırlanıyor…
        </div>
      ) : data ? (
        <div className="space-y-10">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={Activity} label="Sayfa görüntüleme" value={String(data.totals.pageViews)} />
            <KpiCard icon={Users} label="Benzersiz oturum" value={String(data.totals.uniqueSessions)} />
            <KpiCard icon={Globe} label="Benzersiz IP" value={String(data.totals.uniqueIps)} />
            <KpiCard icon={Monitor} label="Bot trafiği" value={String(data.totals.botViews)} />
          </section>

          {data.dailyViews.length > 0 && (
            <section className="card-premium">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-navy-900">
                Günlük ziyaret
              </h2>
              <div className="space-y-3">
                {data.dailyViews.map((d) => (
                  <div key={d.date}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-navy-900">{d.label}</span>
                      <span className="text-clinical-muted">{d.count} görüntüleme</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-clinical-light">
                      <div
                        className="h-full rounded-full bg-navy-900 transition-all"
                        style={{ width: `${Math.round((d.count / maxDaily) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownCard title="En çok ziyaret edilen sayfalar" rows={data.topPages} />
            <BreakdownCard title="Yönlendiren kaynaklar" rows={data.topReferrers} />
            <BreakdownCard title="Cihaz türü" rows={data.byDevice} iconKeys={DEVICE_ICONS} />
            <BreakdownCard title="Tarayıcı" rows={data.byBrowser} />
            <BreakdownCard title="İşletim sistemi" rows={data.byOs} />
          </div>

          <section className="card-premium overflow-hidden !p-0">
            <div className="border-b border-clinical-border px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-navy-900">
                Son ziyaretler
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-clinical-border bg-clinical-light">
                    {[
                      "Tarih",
                      "URL",
                      "IP",
                      "Cihaz",
                      "Tarayıcı / OS",
                      "Ekran",
                      "Referrer",
                      "Üye",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-clinical-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-clinical-border">
                  {data.recentViews.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-clinical-muted">
                        Seçilen dönemde ziyaret kaydı yok.
                      </td>
                    </tr>
                  ) : (
                    data.recentViews.map((v) => (
                      <tr key={v.id} className="hover:bg-clinical-light/50">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-clinical-muted">
                          {formatDateTimeCompact(v.createdAt)}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs">
                          {v.path}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                          {v.ipAddress ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs capitalize">
                          {v.deviceType ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          {v.browser ?? "—"} / {v.os ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-clinical-muted">
                          {v.screenWidth && v.screenHeight
                            ? `${v.screenWidth}×${v.screenHeight}`
                            : "—"}
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-xs text-clinical-muted">
                          {v.referrer ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          {v.userEmail ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-clinical-border px-6 py-3">
                <p className="text-xs text-clinical-muted">
                  Toplam {data.recentTotal} kayıt · Sayfa {page + 1} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-premium border border-clinical-border px-3 py-1 text-xs disabled:opacity-40"
                  >
                    Önceki
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-premium border border-clinical-border px-3 py-1 text-xs disabled:opacity-40"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="card-premium !p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  iconKeys,
}: {
  title: string;
  rows: { key?: string; label: string; count: number }[];
  iconKeys?: Record<string, typeof Monitor>;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="card-premium">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-navy-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-clinical-muted">Veri yok.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const Icon = r.key && iconKeys ? iconKeys[r.key] : undefined;
            return (
              <div key={r.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-navy-900">
                    {Icon ? <Icon className="h-3.5 w-3.5 text-clinical-muted" /> : null}
                    {r.label}
                  </span>
                  <span className="text-clinical-muted">{r.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-clinical-light">
                  <div
                    className="h-full rounded-full bg-navy-700"
                    style={{ width: `${Math.round((r.count / max) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
