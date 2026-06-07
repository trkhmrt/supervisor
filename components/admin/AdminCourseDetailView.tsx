"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { learningOutcomesToText, parseLearningOutlinesText } from "@/lib/courses/form";
import { LearningOutcomesField } from "@/components/admin/LearningOutcomesField";
import type { AdminCourseDetail, CourseEnrollment, CourseEnrollmentStatus } from "@/lib/types";

const inputClass =
  "w-full rounded-premium border border-clinical-border bg-white px-4 py-2.5 text-sm focus:border-navy-900 focus:outline-none";

const enrollmentStatusLabel: Record<CourseEnrollmentStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal",
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type FormState = {
  title: string;
  description: string;
  learningOutcomes: string;
  cover: string;
  maxParticipants: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  acceptsApplications: boolean;
};

function courseToForm(course: AdminCourseDetail): FormState {
  return {
    title: course.title,
    description: course.description,
    learningOutcomes: learningOutcomesToText(course.learningOutcomes ?? []),
    cover: course.cover,
    maxParticipants: course.maxParticipants != null ? String(course.maxParticipants) : "",
    startsAt: toDatetimeLocal(course.startsAt),
    endsAt: toDatetimeLocal(course.endsAt),
    active: course.active,
    acceptsApplications: course.acceptsApplications,
  };
}

export function AdminCourseDetailView({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingEnrollmentId, setUpdatingEnrollmentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Eğitim yüklenemedi");
      setCourse(data);
      setForm(courseToForm(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setCourse(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          learningOutcomes: parseLearningOutlinesText(form.learningOutcomes),
          cover: form.cover.trim(),
          maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
          startsAt: fromDatetimeLocal(form.startsAt),
          endsAt: fromDatetimeLocal(form.endsAt),
          active: form.active,
          acceptsApplications: form.acceptsApplications,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi");
      setSuccess("Eğitim güncellendi.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!course) return;
    if (!window.confirm(`"${course.title}" eğitimini silmek istediğinize emin misiniz?`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      router.push("/dashboard/kurslar");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
      setDeleting(false);
    }
  }

  async function updateEnrollment(enrollmentId: string, status: CourseEnrollmentStatus) {
    setUpdatingEnrollmentId(enrollmentId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/enrollments/${enrollmentId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Durum güncellenemedi");
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              enrollments: prev.enrollments.map((e) =>
                e.id === enrollmentId ? (data as CourseEnrollment) : e
              ),
            }
          : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Durum güncellenemedi");
    } finally {
      setUpdatingEnrollmentId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (!course || !form) {
    return (
      <div>
        <Link
          href="/dashboard/kurslar"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-clinical-muted hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Eğitimler
        </Link>
        <p className="text-sm text-red-600">{error ?? "Eğitim bulunamadı."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/kurslar"
            className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-clinical-muted hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Eğitimler
          </Link>
          <h1 className="h2-premium text-3xl">{course.title}</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            {course.supervisorName} · <span className="font-mono text-xs">{course.slug}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {course.active && (
            <Link
              href={`/egitimler/${course.slug}`}
              target="_blank"
              className="btn-outline-navy py-2 px-4 text-xs inline-flex items-center gap-2"
            >
              Sitede gör
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-premium border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Sil
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-premium border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-12">
        <form onSubmit={handleSave} className="card-premium space-y-5 p-6 xl:col-span-7">
          <h2 className="font-bold text-navy-900">Eğitim bilgileri</h2>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
              Başlık
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => f && { ...f, title: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
              Açıklama
            </label>
            <textarea
              required
              rows={8}
              value={form.description}
              onChange={(e) => setForm((f) => f && { ...f, description: e.target.value })}
              className={inputClass}
            />
          </div>

          <LearningOutcomesField
            value={form.learningOutcomes}
            onChange={(learningOutcomes) => setForm((f) => f && { ...f, learningOutcomes })}
            className={inputClass}
          />

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
              Görsel URL
            </label>
            <input
              value={form.cover}
              onChange={(e) => setForm((f) => f && { ...f, cover: e.target.value })}
              className={inputClass}
              placeholder="/images/..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
                Başlangıç
              </label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((f) => f && { ...f, startsAt: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
                Bitiş
              </label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => f && { ...f, endsAt: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-clinical-muted">
              Kontenjan
            </label>
            <input
              type="number"
              min={1}
              value={form.maxParticipants}
              onChange={(e) => setForm((f) => f && { ...f, maxParticipants: e.target.value })}
              className={inputClass}
              placeholder="Sınırsız için boş bırakın"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => f && { ...f, active: e.target.checked })}
                className="rounded border-clinical-border"
              />
              Vitrinde aktif
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.acceptsApplications}
                onChange={(e) =>
                  setForm((f) => f && { ...f, acceptsApplications: e.target.checked })
                }
                className="rounded border-clinical-border"
              />
              Başvuru kabul ediliyor
            </label>
          </div>

          <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs disabled:opacity-50">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </button>
        </form>

        <div className="space-y-6 xl:col-span-5">
          <div className="card-premium overflow-hidden p-0">
            <div className="relative aspect-video w-full bg-clinical-light">
              <Image src={form.cover || course.cover} alt="" fill className="object-cover" />
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-clinical-muted">Eğitmen</span>
                <span className="font-semibold text-navy-900">{course.supervisorName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-clinical-muted">Kayıt</span>
                <span className="font-semibold text-navy-900">
                  {course.enrollmentCount ?? 0}
                  {course.maxParticipants != null ? ` / ${course.maxParticipants}` : ""}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-clinical-muted">Bekleyen başvuru</span>
                <span className="font-semibold text-amber-700">{course.pendingCount ?? 0}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-clinical-muted">Oluşturulma</span>
                <span className="font-semibold text-navy-900">{formatDate(course.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium overflow-x-auto p-6">
        <h2 className="mb-6 font-bold text-navy-900">Başvurular ({course.enrollments.length})</h2>
        {course.enrollments.length === 0 ? (
          <p className="text-sm text-clinical-muted">Henüz başvuru yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-clinical-border text-left text-xs uppercase tracking-widest text-clinical-muted">
                <th className="pb-3 pr-4">Üye</th>
                <th className="pb-3 pr-4">Meslek</th>
                <th className="pb-3 pr-4">Tarih</th>
                <th className="pb-3 pr-4">Durum</th>
                <th className="pb-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {course.enrollments.map((e) => (
                <tr key={e.id} className="border-b border-clinical-border/60 last:border-0">
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-navy-900">{e.user?.fullName ?? "—"}</div>
                    <div className="text-xs text-clinical-muted">{e.user?.email}</div>
                  </td>
                  <td className="py-4 pr-4 text-clinical-muted">{e.user?.profession ?? "—"}</td>
                  <td className="py-4 pr-4 text-xs text-clinical-muted">{formatDate(e.createdAt)}</td>
                  <td className="py-4 pr-4">
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {enrollmentStatusLabel[e.status]}
                    </span>
                  </td>
                  <td className="py-4">
                    <select
                      value={e.status}
                      disabled={updatingEnrollmentId === e.id}
                      onChange={(ev) =>
                        void updateEnrollment(e.id, ev.target.value as CourseEnrollmentStatus)
                      }
                      className="rounded-premium border border-clinical-border px-2 py-1.5 text-xs"
                    >
                      {(["pending", "approved", "rejected", "cancelled"] as const).map((s) => (
                        <option key={s} value={s}>
                          {enrollmentStatusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
