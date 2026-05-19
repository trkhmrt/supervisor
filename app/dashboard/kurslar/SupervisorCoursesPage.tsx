"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useSessionUser } from "@/hooks/useSessionUser";
import { usePanelCourses } from "@/hooks/usePanelCourses";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import type { Course, CourseEnrollment, CourseEnrollmentStatus } from "@/lib/types";

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
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment[]>>({});
  const [loadingEnrollments, setLoadingEnrollments] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    maxParticipants: "",
    startsAt: "",
    endsAt: "",
  });

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

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await panelFetch(user, "/api/panel/courses", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
        }),
      });
      if (!res.ok) throw new Error(await panelErrorMessage(res, "Kurs oluşturulamadı"));
      setForm({ title: "", description: "", maxParticipants: "", startsAt: "", endsAt: "" });
      setShowForm(false);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Kurs oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (course: Course) => {
    const res = await panelFetch(user, `/api/panel/courses/${course.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !course.active }),
    });
    if (!res.ok) {
      alert(await panelErrorMessage(res, "Güncellenemedi"));
      return;
    }
    await reload();
  };

  const removeCourse = async (id: string) => {
    if (!confirm("Bu kursu silmek istediğinize emin misiniz?")) return;
    const res = await panelFetch(user, `/api/panel/courses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert(await panelErrorMessage(res, "Silinemedi"));
      return;
    }
    await reload();
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
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Kurslarım</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Kurslarınızı yönetin; üye başvurularını onaylayın veya reddedin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-navy py-2 px-6 text-xs"
        >
          <Plus className="h-4 w-4" /> Yeni Kurs
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={createCourse} className="card-premium mb-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-900">Yeni kurs</h2>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Kurs adı"
            className="w-full rounded-premium border border-clinical-border px-4 py-2 text-sm"
          />
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Açıklama"
            rows={4}
            className="w-full rounded-premium border border-clinical-border px-4 py-2 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="number"
              min={1}
              value={form.maxParticipants}
              onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
              placeholder="Kontenjan (opsiyonel)"
              className="rounded-premium border border-clinical-border px-4 py-2 text-sm"
            />
            <input
              type="date"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              className="rounded-premium border border-clinical-border px-4 py-2 text-sm"
            />
            <input
              type="date"
              value={form.endsAt}
              onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              className="rounded-premium border border-clinical-border px-4 py-2 text-sm"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs disabled:opacity-50">
            {saving ? "Kaydediliyor…" : "Oluştur"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Kurslar yükleniyor…
        </div>
      ) : courses.length === 0 ? (
        <div className="card-premium border-dashed py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-clinical-muted" />
          <p className="text-sm text-clinical-muted">Henüz kurs eklemediniz.</p>
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
                <div className="flex flex-wrap gap-2">
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
                  <button
                    type="button"
                    onClick={() => void toggleActive(course)}
                    className="btn-outline-navy py-2 px-4 text-xs"
                  >
                    {course.active ? "Yayından kaldır" : "Yayınla"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeCourse(course.id)}
                    className="rounded-premium border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedId === course.id && (
                <div className="mt-6 border-t border-clinical-border pt-6">
                  {loadingEnrollments === course.id ? (
                    <p className="text-sm text-clinical-muted">Başvurular yükleniyor…</p>
                  ) : (enrollments[course.id] ?? []).length === 0 ? (
                    <p className="text-sm text-clinical-muted">Henüz başvuru yok.</p>
                  ) : (
                    <ul className="space-y-3">
                      {(enrollments[course.id] ?? []).map((e) => (
                        <li
                          key={e.id}
                          className="flex flex-col justify-between gap-3 rounded-premium border border-clinical-border px-4 py-3 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="font-bold text-navy-900">{e.user?.fullName ?? "Üye"}</p>
                            <p className="text-xs text-clinical-muted">{e.user?.email}</p>
                            {e.message && (
                              <p className="mt-1 text-sm text-clinical-text">&quot;{e.message}&quot;</p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                              {enrollmentStatusLabel[e.status]}
                            </span>
                            {e.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void updateEnrollment(course.id, e.id, "approved")}
                                  className="btn-navy py-1.5 px-3 text-[10px]"
                                >
                                  Onayla
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void updateEnrollment(course.id, e.id, "rejected")}
                                  className="btn-outline-navy py-1.5 px-3 text-[10px]"
                                >
                                  Reddet
                                </button>
                              </>
                            )}
                          </div>
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
