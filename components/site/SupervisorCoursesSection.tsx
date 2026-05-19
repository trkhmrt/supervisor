"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Send } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { useCurrentUser } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { Course, CourseEnrollment } from "@/lib/types";

export function SupervisorCoursesSection({ supervisorId }: { supervisorId: string }) {
  const user = useCurrentUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [messageByCourse, setMessageByCourse] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/supervisors/${supervisorId}/courses`, { cache: "no-store" });
      if (!res.ok) throw new Error("Kurslar yüklenemedi");
      setCourses(await res.json());
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [supervisorId]);

  const loadMyApplications = useCallback(async () => {
    if (!user || user.role !== "user") return;
    try {
      const res = await fetch("/api/panel/enrollments", { credentials: "include", cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as CourseEnrollment[];
      setAppliedIds(new Set(data.map((e) => e.courseId)));
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    void loadMyApplications();
  }, [loadMyApplications]);

  const apply = async (courseId: string) => {
    if (!user) {
      window.location.href = `/giris?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (user.role !== "user") {
      setError("Kurs başvurusu yalnızca üye hesaplarıyla yapılabilir.");
      return;
    }
    setApplyingId(courseId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageByCourse[courseId] ?? "" }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Başvuru gönderilemedi");
      setAppliedIds((prev) => new Set(prev).add(courseId));
      setSuccess("Başvurunuz alındı. Süpervizör onayı bekleniyor.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Başvuru gönderilemedi");
    } finally {
      setApplyingId(null);
    }
  };

  if (!loading && courses.length === 0) return null;

  return (
    <section className="border-y border-clinical-border bg-clinical-light py-24">
      <div className="container-wide">
        <Reveal>
          <span className="eyebrow-premium">Eğitim Programları</span>
          <h2 className="h2-premium mb-4">Kurslar</h2>
          <p className="mb-10 max-w-2xl text-clinical-muted">
            Bu süpervizörün açtığı kurslara başvurabilirsiniz. Onay sonrası süpervizör sizinle iletişime geçer.
          </p>
        </Reveal>

        {error && (
          <p className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-6 rounded-premium border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-clinical-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Kurslar yükleniyor…
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                applied={appliedIds.has(course.id)}
                applying={applyingId === course.id}
                message={messageByCourse[course.id] ?? ""}
                onMessageChange={(v) =>
                  setMessageByCourse((prev) => ({ ...prev, [course.id]: v }))
                }
                onApply={() => void apply(course.id)}
                loggedIn={!!user}
                canApply={user?.role === "user"}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CourseCard({
  course,
  applied,
  applying,
  message,
  onMessageChange,
  onApply,
  loggedIn,
  canApply,
}: {
  course: Course;
  applied: boolean;
  applying: boolean;
  message: string;
  onMessageChange: (v: string) => void;
  onApply: () => void;
  loggedIn: boolean;
  canApply: boolean;
}) {
  return (
    <div className="card-premium flex flex-col">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-900">{course.title}</h3>
          {course.startsAt && (
            <p className="mt-1 text-xs text-clinical-muted">
              Başlangıç: {formatDate(course.startsAt)}
            </p>
          )}
        </div>
      </div>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-clinical-text">{course.description}</p>
      {course.maxParticipants != null && (
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-clinical-muted">
          Kontenjan: {course.enrollmentCount ?? 0} / {course.maxParticipants}
        </p>
      )}

      {applied ? (
        <p className="rounded-premium border border-navy-100 bg-navy-50 px-4 py-3 text-sm font-bold text-navy-900">
          Başvurunuz alındı (beklemede)
        </p>
      ) : canApply ? (
        <>
          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Kısa bir mesaj (isteğe bağlı)"
            rows={2}
            className="mb-4 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={applying}
            className="btn-navy flex w-full items-center justify-center gap-2 py-2 text-xs disabled:opacity-50"
          >
            {applying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Başvur <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </>
      ) : loggedIn ? (
        <p className="text-xs text-clinical-muted">
          Kurs başvurusu üye hesabıyla yapılır.{" "}
          <Link href="/dashboard/basvurularim" className="font-bold text-navy-900 underline">
            Başvurularım
          </Link>
        </p>
      ) : (
        <Link href="/giris" className="btn-outline-navy w-full py-2 text-center text-xs">
          Başvurmak için giriş yapın
        </Link>
      )}
    </div>
  );
}
