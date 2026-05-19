"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, Plus, Loader2, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { slugify } from "@/lib/utils";
import type { Service } from "@/lib/types";

async function fetchAllServices(): Promise<Service[]> {
  const r = await fetch("/api/admin/services");
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    features: "50 dakikalık online seans\nVaka odaklı çalışma",
    icon: "user",
    duration: "50",
  });

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchAllServices();
      setServices(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Liste yüklenemedi");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleActive = async (s: Service) => {
    try {
      const r = await fetch(`/api/admin/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !s.active }),
      });
      if (!r.ok) throw new Error();
      await reload();
    } catch {
      setError("Durum güncellenemedi");
    }
  };

  const removeService = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    try {
      const r = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      await reload();
    } catch {
      setError("Silinemedi");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const name = form.name.trim();
    const slug = (form.slug.trim() ? slugify(form.slug) : slugify(name)) || "hizmet";
    const features = form.features
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    try {
      const r = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim(),
          features,
          icon: form.icon,
          price: 0,
          duration: Number(form.duration) || 50,
          active: true,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(typeof j.error === "string" ? j.error : "Kayıt başarısız");
      setForm({
        name: "",
        slug: "",
        shortDescription: "",
        description: "",
        features: "50 dakikalık online seans\nVaka odaklı çalışma",
    icon: "user",
    duration: "50",
  });
      setShowForm(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <h1 className="h2-premium text-3xl">Hizmet Yönetimi</h1>
        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-navy-500" />}
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-navy py-2 px-6 text-xs">
            <Plus className="h-4 w-4" /> Yeni Hizmet Ekle
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-10 card-premium border border-navy-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-navy-50 rounded-premium flex items-center justify-center text-navy-900">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-sm uppercase tracking-widest text-navy-900">Yeni hizmet</h2>
          </div>
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Hizmet adı"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
            />
            <input
              placeholder="Slug (boşsa addan üretilir)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Kısa açıklama"
              value={form.shortDescription}
              onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
              className="md:col-span-2 rounded-premium border border-clinical-border px-3 py-2 text-sm"
            />
            <textarea
              required
              placeholder="Uzun açıklama"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="md:col-span-2 h-28 resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
            />
            <textarea
              required
              placeholder="Özellikler (her satır bir madde)"
              value={form.features}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              className="md:col-span-2 h-24 resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
            />
            <select
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
            >
              <option value="user">Bireysel (user)</option>
              <option value="users">Grup (users)</option>
              <option value="handshake">Akran (handshake)</option>
              <option value="stage">Simülasyon (stage)</option>
            </select>
            <input
              type="number"
              min={1}
              placeholder="Süre (dakika)"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-navy py-2 px-6 text-xs">
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {services.map((s) => (
          <div key={s.id} className="card-premium group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-navy-50 rounded-premium flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-all duration-500">
                <ServiceIcon icon={s.icon} className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                    s.active
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-clinical-light text-clinical-muted border-clinical-border"
                  }`}
                >
                  {s.active ? "Aktif" : "Pasif"}
                </span>
                <button
                  type="button"
                  onClick={() => removeService(s.id)}
                  className="p-2 text-clinical-muted hover:text-red-600"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-navy-900 mb-2">{s.name}</h3>
            <p className="text-clinical-muted text-xs mb-1 font-mono">{s.slug}</p>
            <p className="text-clinical-muted text-sm leading-relaxed mb-8 line-clamp-2">{s.description}</p>

            <div className="flex items-center justify-between pt-6 border-t border-clinical-border">
              <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                {s.duration} dk
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(s)}
                  className="btn-outline-navy py-2 px-4 text-[10px] uppercase font-bold tracking-widest"
                >
                  {s.active ? "Pasif Yap" : "Aktif Et"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && services.length === 0 && (
        <p className="mt-10 text-center text-sm text-clinical-muted">
          Henüz hizmet yok veya veritabanına bağlanılamıyor. DATABASE_URL tanımlayıp sayfayı yenileyin.
        </p>
      )}
    </AdminShell>
  );
}
