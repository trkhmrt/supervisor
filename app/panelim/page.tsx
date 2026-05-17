"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  Layers,
  UserPlus,
  ArrowUpRight,
  Loader2,
  Database,
} from "lucide-react";
import {
  canCreateServices,
  canListServices,
  canListSupervisors,
} from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useAppStore } from "@/lib/store";
import type { Service, Supervisor } from "@/lib/types";

export default function PanelDashboard() {
  const user = useSessionUser()!;
  const manageSupervisors = canListSupervisors(user);
  const manageServices = canListServices(user);
  const canAddService = canCreateServices(user);
  const appointments = useAppStore((s) =>
    s.appointments
      .filter((a) =>
        user.role === "supervisor"
          ? a.supervisorName === user.fullName
          : a.superviseeId === user.id
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  );

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const loadDb = useCallback(async () => {
    setDbError(null);
    setDbLoading(true);
    try {
      const [supRes, svcRes] = await Promise.all([
        fetch("/api/supervisors"),
        fetch("/api/services"),
      ]);
      if (!supRes.ok || !svcRes.ok) {
        throw new Error("Veritabanı verisi alınamadı");
      }
      setSupervisors(await supRes.json());
      setServices(await svcRes.json());
    } catch (e) {
      setDbError(e instanceof Error ? e.message : "Veritabanı bağlantısı kurulamadı");
      setSupervisors([]);
      setServices([]);
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDb();
  }, [loadDb]);

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed"
  );
  const activeServices = services.filter((s) => s.active);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Genel Bakış</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            {manageSupervisors || manageServices
              ? "Süpervizör ve hizmet kayıtlarını buradan yönetebilirsiniz."
              : "Randevularınızı takip edin; süpervizör ve hizmetleri siteden inceleyebilirsiniz."}
          </p>
        </div>
        {dbLoading && <Loader2 className="h-5 w-5 animate-spin text-navy-500" />}
      </div>

      {dbError && (
        <div className="mb-6 flex items-start gap-3 rounded-premium border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">{dbError}</p>
            <p className="mt-1 text-xs opacity-80">
              `.env.local` içinde DATABASE_URL ve DIRECT_URL tanımlı olmalı; ardından sayfayı yenileyin.
            </p>
          </div>
        </div>
      )}

      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Süpervizör"
          value={supervisors.length}
          icon={UserPlus}
          href="/panelim/supervizorler"
        />
        <StatCard
          title="Hizmet"
          value={services.length}
          sub={`${activeServices.length} aktif`}
          icon={Layers}
          href={manageServices ? "/panelim/hizmetler" : "/hizmetler"}
        />
        <StatCard title="Yaklaşan Randevu" value={upcoming.length} icon={Calendar} href="/panelim/randevular" />
        <StatCard
          title="Bekleyen Ödeme"
          value={upcoming.filter((a) => !a.paymentApproved).length}
          icon={CreditCard}
          href="/panelim/randevular"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="card-premium">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-navy-900">
                Son Süpervizörler
              </h2>
              <Link
                href={manageSupervisors ? "/panelim/supervizorler" : "/supervizorler"}
                className="flex items-center gap-1 text-xs font-bold text-navy-500 hover:text-navy-900"
              >
                {manageSupervisors ? "Tümünü yönet" : "Tümünü gör"}{" "}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {supervisors.length === 0 ? (
              <p className="py-8 text-center text-sm text-clinical-muted">
                {dbLoading
                  ? "Yükleniyor…"
                  : manageSupervisors
                    ? "Henüz süpervizör yok."
                    : "Henüz süpervizör kaydı yok."}
              </p>
            ) : (
              <div className="space-y-3">
                {supervisors.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 rounded-premium border border-clinical-border bg-clinical-light p-4"
                  >
                    <img src={s.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-navy-900">{s.fullName}</div>
                      <div className="truncate text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                        {s.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="card-premium">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-navy-900">
                Hizmetler
              </h2>
              <Link
                href={manageServices ? "/panelim/hizmetler" : "/hizmetler"}
                className="flex items-center gap-1 text-xs font-bold text-navy-500 hover:text-navy-900"
              >
                {manageServices ? "Tümünü yönet" : "Tümünü gör"}{" "}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {services.length === 0 ? (
              <p className="py-8 text-center text-sm text-clinical-muted">
                {dbLoading
                  ? "Yükleniyor…"
                  : manageServices
                    ? "Henüz hizmet yok."
                    : "Henüz hizmet kaydı yok."}
              </p>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-premium border border-clinical-border px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-bold text-navy-900">{s.name}</div>
                      <div className="text-[10px] text-clinical-muted">{s.slug}</div>
                    </div>
                    <span
                      className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                        s.active
                          ? "border-green-100 bg-green-50 text-green-700"
                          : "border-clinical-border bg-clinical-light text-clinical-muted"
                      }`}
                    >
                      {s.active ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/panelim/supervizorler" className="btn-navy py-3 text-center text-xs">
              <UserPlus className="inline h-4 w-4" /> Süpervizör Ekle
            </Link>
            {canAddService ? (
              <Link href="/panelim/hizmetler" className="btn-outline-navy py-3 text-center text-xs">
                <Layers className="inline h-4 w-4" /> Hizmet Ekle
              </Link>
            ) : (
              <Link href="/hizmetler" className="btn-outline-navy py-3 text-center text-xs">
                <Layers className="inline h-4 w-4" /> Hizmetler
              </Link>
            )}
          </div>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="mt-10 card-premium">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-navy-900">
              Yaklaşan Randevularınız
            </h2>
            <Link href="/panelim/randevular" className="text-xs font-bold text-navy-500 hover:text-navy-900">
              Tümü →
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-premium border border-clinical-border px-4 py-3 text-sm"
              >
                <span className="font-bold text-navy-900">
                  {user.role === "supervisor" ? a.superviseeName : a.supervisorName}
                </span>
                <span className="flex items-center gap-2 text-xs text-clinical-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {a.date} {a.startTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link href={href} className="card-premium group transition-all hover:border-navy-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-premium bg-navy-50 text-navy-900 transition-colors group-hover:bg-navy-900 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-clinical-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">{title}</div>
      <div className="mt-1 text-3xl font-bold text-navy-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-clinical-muted">{sub}</div>}
    </Link>
  );
}
