"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { formatDate } from "@/lib/utils";
import type { AdminCourse, Supervisor } from "@/lib/types";

function AdminCourseCreateForm({
  supervisors,
  onCreated,
}: {
  supervisors: Supervisor[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supervisorId: "",
    title: "",
    description: "",
    maxParticipants: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.supervisorId || !form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supervisorId: form.supervisorId,
          title: form.title,
          description: form.description,
          maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Oluşturulamadı");
      setForm({ supervisorId: "", title: "", description: "", maxParticipants: "" });
      setOpen(false);
      onCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Oluşturulamadı");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-navy py-2 px-6 text-xs shrink-0">
        <Plus className="h-4 w-4" /> Yeni Eğitim
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium w-full max-w-lg space-y-3 p-4">
      <select
        required
        value={form.supervisorId}
        onChange={(e) => setForm((f) => ({ ...f, supervisorId: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      >
        <option value="">Süpervizör seçin</option>
        {supervisors.map((s) => (
          <option key={s.id} value={s.id}>
            {s.fullName}
          </option>
        ))}
      </select>
      <input
        required
        placeholder="Eğitim adı"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <textarea
        required
        placeholder="Açıklama"
        rows={3}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <input
        type="number"
        min={1}
        placeholder="Kontenjan"
        value={form.maxParticipants}
        onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-navy py-2 px-4 text-xs disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline-navy py-2 px-4 text-xs">
          Vazgeç
        </button>
      </div>
    </form>
  );
}

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
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Kurslar</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Eğitim programlarını oluşturun, süpervizör atayın ve yönetin.
          </p>
        </div>
        <AdminCourseCreateForm supervisors={supervisors} onCreated={load} />
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
