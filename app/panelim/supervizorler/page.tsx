"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UserPlus, ShieldCheck, Trash2, Loader2, ExternalLink } from "lucide-react";
import { canDeleteSupervisors, canListSupervisors } from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import type { Supervisor } from "@/lib/types";

export default function PanelSupervisorsPage() {
  const user = useSessionUser()!;
  const canManage = canListSupervisors(user);
  const canDelete = canDeleteSupervisors(user);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    title: "",
    photo: "https://i.pravatar.cc/300?img=12",
    bio: "",
    license: "",
    pricePerSession: "1500",
    yearsExperience: "10",
    expertise: "Klinik Psikoloji, Travma",
  });

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = canManage
        ? await panelFetch(user, "/api/panel/supervisors")
        : await fetch("/api/supervisors");
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Liste yüklenemedi"));
      setSupervisors(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Liste yüklenemedi");
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  }, [user, canManage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const expertise = form.expertise
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const r = await panelFetch(user, "/api/panel/supervisors", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          title: form.title.trim(),
          photo: form.photo.trim(),
          bio: form.bio.trim(),
          license: form.license.trim(),
          pricePerSession: Number(form.pricePerSession) || 0,
          yearsExperience: Number(form.yearsExperience) || 0,
          expertise,
        }),
      });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Kayıt başarısız"));
      setForm({
        fullName: "",
        title: "",
        photo: "https://i.pravatar.cc/300?img=12",
        bio: "",
        license: "",
        pricePerSession: "1500",
        yearsExperience: "10",
        expertise: "Klinik Psikoloji, Travma",
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu süpervizörü silmek istediğinize emin misiniz?")) return;
    try {
      const r = await panelFetch(user, `/api/panel/supervisors/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Silinemedi"));
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
    }
  };

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="h2-premium text-3xl">
            {canManage ? "Süpervizör Yönetimi" : "Süpervizör Ekle"}
          </h1>
          <p className="mt-2 text-sm text-clinical-muted">
            {canManage
              ? "Kayıtlar veritabanından okunur; buradan ekleyebilir veya silebilirsiniz."
              : "Yeni süpervizör kaydı oluşturmak için formu doldurun. Yetkiniz yoksa kayıt sırasında bilgilendirilirsiniz."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-navy-500" />}
          <Link
            href="/supervizorler"
            target="_blank"
            rel="noreferrer"
            className="btn-outline-navy py-2 px-4 text-xs"
          >
            <ExternalLink className="h-4 w-4" /> Sitede Gör
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="card-premium border border-clinical-border">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-navy-900">
                Yeni Süpervizör
              </h3>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Ad Soyad"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Unvan"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Fotoğraf URL"
                value={form.photo}
                onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <textarea
                required
                placeholder="Biyografi"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="h-24 w-full resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Lisans"
                value={form.license}
                onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <input
                placeholder="Uzmanlıklar (virgülle)"
                value={form.expertise}
                onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Seans ücreti"
                  value={form.pricePerSession}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerSession: e.target.value }))}
                  className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Yıl tecrübe"
                  value={form.yearsExperience}
                  onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
                  className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" disabled={creating} className="btn-navy w-full py-3 text-xs">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Veritabanına Kaydet"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="card-premium">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy-900">
                Kayıtlı Süpervizörler ({supervisors.length})
              </h3>
              <UserPlus className="h-4 w-4 text-clinical-muted" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {supervisors.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 rounded-premium border border-clinical-border bg-clinical-light p-4 transition-all hover:border-navy-900"
                >
                  <img src={s.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-navy-900">{s.fullName}</div>
                    <div className="truncate text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                      {s.title}
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-clinical-muted hover:text-red-600"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!loading && supervisors.length === 0 && (
              <p className="mt-6 text-center text-sm text-clinical-muted">
                Henüz süpervizör yok. Soldaki formdan ekleyebilirsiniz.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
