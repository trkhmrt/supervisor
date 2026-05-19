"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { formatDate } from "@/lib/utils";
import type { AdminCourse, Supervisor } from "@/lib/types";

type Props = {
  supervisorsApi?: string;
};

export function AdminCoursesList({ supervisorsApi = "/api/adminpanel/supervisors" }: Props) {
  const searchParams = useSearchParams();
  const initialSupervisorId = searchParams.get("supervisorId") ?? "";
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [supervisorId, setSupervisorId] = useState(initialSupervisorId);
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    if (initialSupervisorId) setSupervisorId(initialSupervisorId);
  }, [initialSupervisorId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (supervisorId) params.set("supervisorId", supervisorId);
      if (activeFilter === "true" || activeFilter === "false") params.set("active", activeFilter);

      const [courseRes, supRes] = await Promise.all([
        fetch(`/api/admin/courses?${params}`, { credentials: "include" }),
        fetch(supervisorsApi, { credentials: "include" }),
      ]);
      const courseData = await courseRes.json();
      if (!courseRes.ok) throw new Error(courseData.error ?? "Kurslar yüklenemedi");
      setCourses(courseData);
      if (supRes.ok) setSupervisors(await supRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, supervisorId, activeFilter, supervisorsApi]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const supervisorOptions = useMemo(
    () => [
      { value: "", label: "Tüm süpervizörler" },
      ...supervisors.map((s) => ({ value: s.id, label: s.fullName })),
    ],
    [supervisors]
  );

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Kurslar</h1>
        <p className="mt-2 text-sm text-clinical-muted">
          Tüm süpervizör kurslarını görüntüleyin ve filtreleyin.
        </p>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium p-4">
          {error}
        </p>
      )}

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Kurs adı, açıklama veya süpervizör ara…"
        selectLabel="Süpervizör"
        selectValue={supervisorId}
        selectOptions={supervisorOptions}
        onSelectChange={setSupervisorId}
        secondSelectLabel="Durum"
        secondSelectValue={activeFilter}
        secondSelectOptions={[
          { value: "", label: "Tümü" },
          { value: "true", label: "Aktif" },
          { value: "false", label: "Pasif" },
        ]}
        onSecondSelectChange={setActiveFilter}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
        </div>
      ) : (
        <div className="card-premium overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-clinical-border text-left text-xs uppercase tracking-widest text-clinical-muted">
                <th className="pb-3 pr-4">Kurs</th>
                <th className="pb-3 pr-4">Süpervizör</th>
                <th className="pb-3 pr-4">Durum</th>
                <th className="pb-3 pr-4">Başvuru</th>
                <th className="pb-3">Oluşturulma</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-clinical-border/60 last:border-0">
                  <td className="py-4 pr-4">
                    <div className="font-semibold text-navy-900">{c.title}</div>
                    <div className="text-xs text-clinical-muted font-mono">{c.slug}</div>
                  </td>
                  <td className="py-4 pr-4 text-clinical-muted">{c.supervisorName}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                        c.active
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-50 text-gray-600 border-gray-100"
                      }`}
                    >
                      {c.active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-clinical-muted">
                    {c.enrollmentCount ?? 0} kayıt
                    {(c.pendingCount ?? 0) > 0 && (
                      <span className="ml-1 text-amber-700">· {c.pendingCount} bekleyen</span>
                    )}
                  </td>
                  <td className="py-4 text-xs text-clinical-muted">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-clinical-muted">
                    Filtrelere uygun kurs bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
