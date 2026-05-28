"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Loader2, Users } from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";
import { usePanelCourses } from "@/hooks/usePanelCourses";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import type { CourseEnrollment, CourseEnrollmentStatus } from "@/lib/types";

const enrollmentStatusLabel: Record<CourseEnrollmentStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal",
};

export function SupervisorCoursesPage() {
  const router = useRouter();
  const user = useSessionUser()!;
  const { courses, loading, error, reload } = usePanelCourses(user);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment[]>>({});
  const [loadingEnrollments, setLoadingEnrollments] = useState<string | null>(null);

  useEffect(() => {
    if (user.role !== "supervisor") router.replace("/dashboard");
  }, [user.role, router]);

  const loadEnrollments = async (courseId: string) => {
    if (enrollments[courseId]) {
      setExpandedId(expandedId === courseId ? null : courseId);
      return;
    }
    setLoadingEnrollments(courseId);
    try {
      const res = await panelFetch(user, `/api/panel/courses/${courseId}/enrollments`);
      if (!res.ok) throw new Error(await panelErrorMessage(res, "Başvurular yüklenemedi"));
      const data = await res.json();
      setEnrollments((prev) => ({ ...prev, [courseId]: data }));
      setExpandedId(courseId);
    } catch {
      /* handled via empty list */
    } finally {
      setLoadingEnrollments(null);
    }
  };

  const updateEnrollment = async (
    courseId: string,
    enrollmentId: string,
    status: CourseEnrollmentStatus
  ) => {
    const res = await panelFetch(
      user,
      `/api/panel/courses/${courseId}/enrollments/${enrollmentId}`,
      { method: "PATCH", body: JSON.stringify({ status }) }
    );
    if (!res.ok) {
      alert(await panelErrorMessage(res, "Durum güncellenemedi"));
      return;
    }
    const updated = (await res.json()) as CourseEnrollment;
    setEnrollments((prev) => ({
      ...prev,
      [courseId]: (prev[courseId] ?? []).map((e) => (e.id === enrollmentId ? updated : e)),
    }));
    await reload();
  };

  if (user.role !== "supervisor") return null;

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Kurs Başvuruları</h1>
        <p className="mt-2 text-sm text-clinical-muted">
          Size atanmış kurslardaki üye başvurularını onaylayın veya reddedin.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Kurslar yükleniyor…
        </div>
      ) : courses.length === 0 ? (
        <div className="card-premium border-dashed py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-clinical-muted" />
          <p className="text-sm text-clinical-muted">Size atanmış kurs bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="card-premium">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-navy-900">{course.title}</h3>
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        course.active
                          ? "border-green-100 bg-green-50 text-green-700"
                          : "border-black/15 bg-[#f1f0f0] text-black"
                      }`}
                    >
                      {course.active ? "Yayında" : "Pasif"}
                    </span>
                    {(course.pendingCount ?? 0) > 0 && (
                      <span className="rounded border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                        {course.pendingCount} bekleyen başvuru
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-clinical-muted line-clamp-2">{course.description}</p>
                  <p className="mt-2 text-xs text-clinical-muted">
                    <Users className="mr-1 inline h-3.5 w-3.5" />
                    {course.enrollmentCount ?? 0} başvuru
                    {course.maxParticipants != null && ` / ${course.maxParticipants} kontenjan`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadEnrollments(course.id)}
                  className="btn-outline-navy py-2 px-4 text-xs"
                >
                  Başvurular
                  {expandedId === course.id ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {expandedId === course.id && (
                <div className="mt-6 border-t border-clinical-border pt-6">
                  {loadingEnrollments === course.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-navy-400" />
                  ) : (enrollments[course.id] ?? []).length === 0 ? (
                    <p className="text-sm text-clinical-muted">Henüz başvuru yok.</p>
                  ) : (
                    <ul className="divide-y divide-clinical-border">
                      {(enrollments[course.id] ?? []).map((en) => (
                        <li
                          key={en.id}
                          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="font-semibold text-navy-900">
                              {en.user?.fullName ?? "Kullanıcı"}
                            </div>
                            <div className="text-sm text-clinical-muted">{en.user?.email}</div>
                            {en.user?.profession && (
                              <div className="text-xs text-clinical-muted">{en.user.profession}</div>
                            )}
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                              {enrollmentStatusLabel[en.status]}
                            </div>
                          </div>
                          {en.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => void updateEnrollment(course.id, en.id, "approved")}
                                className="btn-navy py-2 px-4 text-xs"
                              >
                                Onayla
                              </button>
                              <button
                                type="button"
                                onClick={() => void updateEnrollment(course.id, en.id, "rejected")}
                                className="btn-outline-navy py-2 px-4 text-xs"
                              >
                                Reddet
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
