"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { formatDate } from "@/lib/utils";
import type { AdminCourse, Supervisor } from "@/lib/types";

const inputClass =
  "w-full rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm focus:border-navy-900 focus:outline-none";

function AdminCourseCreateForm({
  supervisors,
  onCreated,
}: {
  supervisors: Supervisor[];
  onCreated: (newId?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    supervisorId: "",
    title: "",
    description: "",
    cover: "",
    maxParticipants: "",
    startsAt: "",
    endsAt: "",
    active: true,
    acceptsApplications: true,
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
          cover: form.cover.trim() || undefined,
          maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          active: form.active,
          acceptsApplications: form.acceptsApplications,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Oluşturulamadı");
      setForm({
        supervisorId: "",
        title: "",
        description: "",
        cover: "",
        maxParticipants: "",
        startsAt: "",
        endsAt: "",
        active: true,
        acceptsApplications: true,
      });
      setOpen(false);
      onCreated(data.id as string | undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Oluşturulamadı");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-navy shrink-0 px-6 py-2 text-xs">
        <Plus className="h-4 w-4" /> Yeni Eğitim
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium w-full max-w-2xl space-y-3 p-4">
      <h3 className="font-bold text-navy-900">Yeni eğitim</h3>
      <select
        required
        value={form.supervisorId}
        onChange={(e) => setForm((f) => ({ ...f, supervisorId: e.target.value }))}
        className={inputClass}
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
        className={inputClass}
      />
      <textarea
        required
        placeholder="Açıklama"
        rows={4}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        className={inputClass}
      />
      <input
        placeholder="Görsel URL (isteğe bağlı)"
        value={form.cover}
        onChange={(e) => setForm((f) => ({ ...f, cover: e.target.value }))}
        className={inputClass}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="datetime-local"
          value={form.startsAt}
          onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
          className={inputClass}
        />
        <input
          type="datetime-local"
          value={form.endsAt}
          onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
          className={inputClass}
        />
      </div>
      <input
        type="number"
        min={1}
        placeholder="Kontenjan"
        value={form.maxParticipants}
        onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
        className={inputClass}
      />
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          />
          Aktif
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.acceptsApplications}
            onChange={(e) => setForm((f) => ({ ...f, acceptsApplications: e.target.checked }))}
          />
          Başvuru açık
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-navy px-4 py-2 text-xs disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline-navy px-4 py-2 text-xs">
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      if (!courseRes.ok) throw new Error(courseData.error ?? "Eğitimler yüklenemedi");
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

  async function handleDelete(course: AdminCourse) {
    if (!window.confirm(`"${course.title}" eğitimini silmek istediğinize emin misiniz?`)) return;
    setDeletingId(course.id);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCreated(newId?: string) {
    void load();
    if (newId) {
      window.location.href = `/dashboard/kurslar/${newId}`;
    }
  }

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Eğitimler</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Eğitim programlarını oluşturun, düzenleyin ve başvuruları yönetin.
          </p>
        </div>
        <AdminCourseCreateForm supervisors={supervisors} onCreated={handleCreated} />
      </div>

      {error && (
        <p className="mb-6 rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Eğitim adı, açıklama veya süpervizör ara…"
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
                <th className="pb-3 pr-4">Eğitim</th>
                <th className="pb-3 pr-4">Süpervizör</th>
                <th className="pb-3 pr-4">Durum</th>
                <th className="pb-3 pr-4">Başvuru</th>
                <th className="pb-3 pr-4">Oluşturulma</th>
                <th className="pb-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-clinical-border/60 last:border-0">
                  <td className="py-4 pr-4">
                    <Link
                      href={`/dashboard/kurslar/${c.id}`}
                      className="font-semibold text-navy-900 hover:underline"
                    >
                      {c.title}
                    </Link>
                    <div className="font-mono text-xs text-clinical-muted">{c.slug}</div>
                  </td>
                  <td className="py-4 pr-4 text-clinical-muted">{c.supervisorName}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                        c.active
                          ? "border-green-100 bg-green-50 text-green-700"
                          : "border-gray-100 bg-gray-50 text-gray-600"
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
                  <td className="py-4 pr-4 text-xs text-clinical-muted">{formatDate(c.createdAt)}</td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/kurslar/${c.id}`}
                        className="inline-flex items-center gap-1 rounded-premium border border-clinical-border px-2.5 py-1.5 text-xs font-bold text-navy-900 hover:bg-clinical-light"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detay
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(c)}
                        disabled={deletingId === c.id}
                        className="inline-flex items-center gap-1 rounded-premium border border-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-clinical-muted">
                    Filtrelere uygun eğitim bulunamadı.
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
