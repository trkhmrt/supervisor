"use client";

import Link from "next/link";
import { Calendar, Clock, CreditCard, ArrowUpRight, BookOpen } from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";
import { usePanelAppointments } from "@/hooks/usePanelAppointments";
import { usePanelCourses } from "@/hooks/usePanelCourses";

export function UserOverviewPage() {
  const user = useSessionUser();
  const { appointments, loading } = usePanelAppointments(user, { limit: 15 });
  const { courses, loading: coursesLoading } = usePanelCourses(
    user?.role === "supervisor" ? user : null
  );

  if (!user) return null;

  const isSupervisor = user.role === "supervisor";
  const pendingApplications = courses.reduce((n, c) => n + (c.pendingCount ?? 0), 0);

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "completed"
  );

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Genel Bakış</h1>
        <p className="mt-2 text-sm text-clinical-muted">
          {isSupervisor
            ? "Randevularınızı ve kurslarınızı buradan yönetebilirsiniz."
            : "Randevularınızı buradan takip edebilir; yeni seans için süpervizör listesine gidebilirsiniz."}
        </p>
      </div>

      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Yaklaşan Randevu"
          value={loading ? "—" : upcoming.length}
          icon={Calendar}
          href="/dashboard/randevular"
        />
        {!isSupervisor ? (
          <StatCard
            title="Bekleyen Ödeme"
            value={loading ? "—" : upcoming.filter((a) => !a.paymentApproved).length}
            icon={CreditCard}
            href="/dashboard/randevular"
          />
        ) : (
          <>
            <StatCard
              title="Aktif Kurs"
              value={coursesLoading ? "—" : courses.filter((c) => c.active).length}
              icon={BookOpen}
              href="/dashboard/kurslar"
            />
            <StatCard
              title="Bekleyen Başvuru"
              value={coursesLoading ? "—" : pendingApplications}
              icon={BookOpen}
              href="/dashboard/kurslar"
            />
          </>
        )}
      </div>

      <div className="card-premium">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy-900">
            Yaklaşan Randevularınız
          </h2>
          <Link
            href="/dashboard/randevular"
            className="flex items-center gap-1 text-xs font-bold text-navy-500 hover:text-navy-900"
          >
            Tümü <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-clinical-muted">Yükleniyor…</p>
        ) : upcoming.length === 0 ? (
          <div className="py-10 text-center">
            <p className="mb-6 text-sm text-clinical-muted">Planlanmış randevu yok.</p>
            {user.role !== "supervisor" && (
              <Link href="/supervizorler" className="btn-navy">
                Süpervizörleri İncele
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex flex-col justify-between gap-2 rounded-premium border border-clinical-border px-4 py-3 sm:flex-row sm:items-center"
              >
                <span className="text-sm font-bold text-navy-900">
                  {user.role === "supervisor" ? a.superviseeName : a.supervisorName}
                </span>
                <span className="flex items-center gap-2 text-xs text-clinical-muted">
                  <Clock className="h-3.5 w-3.5" />
                  {a.date} {a.startTime}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number | string;
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
    </Link>
  );
}
