"use client";

import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useMyEnrollments } from "@/hooks/usePanelCourses";
import type { CourseEnrollmentStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const statusLabel: Record<CourseEnrollmentStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal",
};

const statusColor: Record<CourseEnrollmentStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  approved: "bg-green-50 text-green-700 border-green-100",
  rejected: "border-black/15 bg-[#f1f0f0] text-black",
  cancelled: "border-black/15 bg-[#f1f0f0] text-black",
};

export default function PanelEnrollmentsPage() {
  const user = useSessionUser()!;
  const { enrollments, loading, error } = useMyEnrollments(user);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Kurs Başvurularım</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Süpervizör kurslarına yaptığınız başvuruların durumunu takip edin.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yükleniyor…
        </div>
      ) : enrollments.length === 0 ? (
        <div className="card-premium border-dashed py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-clinical-muted" />
          <p className="mb-6 text-sm text-clinical-muted">Henüz kurs başvurunuz yok.</p>
          <Link href="/supervizorler" className="btn-navy">
            Süpervizörleri İncele
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => (
            <div key={e.id} className="card-premium">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${statusColor[e.status]}`}
                >
                  {statusLabel[e.status]}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  {formatDate(e.createdAt)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-navy-900">{e.course?.title ?? "Kurs"}</h3>
              {e.course?.supervisorId && (
                <Link
                  href={`/supervizorler/${e.course.supervisorId}`}
                  className="mt-2 inline-block text-xs font-bold text-navy-500 hover:text-navy-900"
                >
                  Süpervizör profiline git →
                </Link>
              )}
              {e.message && (
                <p className="mt-3 text-sm text-clinical-muted">&quot;{e.message}&quot;</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
