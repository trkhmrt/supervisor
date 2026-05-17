"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Layers, Plus, Loader2, Trash2, ExternalLink } from "lucide-react";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import {
  canCreateServices,
  canDeleteServices,
  canListServices,
  canUpdateServices,
} from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import { formatPrice, slugify } from "@/lib/utils";
import type { Service } from "@/lib/types";

export default function PanelServicesPage() {
  const router = useRouter();
  const user = useSessionUser()!;
  const canCreate = canCreateServices(user);
  const canUpdate = canUpdateServices(user);
  const canDelete = canDeleteServices(user);
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
    price: "1500",
    duration: "50",
  });

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const r = await panelFetch(user, "/api/panel/services");
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Liste yüklenemedi"));
      setServices(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Liste yüklenemedi");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!canListServices(user)) {
      router.replace("/hizmetler");
      return;
    }
    reload();
  }, [reload, router, user]);

  const toggleActive = async (s: Service) => {
    try {
      const r = await panelFetch(user, `/api/panel/services/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !s.active }),
      });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Durum güncellenemedi"));
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Durum güncellenemedi");
    }
  };

  const removeService = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    try {
      const r = await panelFetch(user, `/api/panel/services/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Silinemedi"));
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
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
      const r = await panelFetch(user, "/api/panel/services", {
        method: "POST",
        body: JSON.stringify({
          name,
          slug,
          shortDescription: form.shortDescription.trim(),
          description: form.description.trim(),
          features,
          icon: form.icon,
          price: Number(form.price) || 0,
          duration: Number(form.duration) || 50,
          active: true,
        }),
      });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Kayıt başarısız"));
      setForm({
        name: "",
        slug: "",
        shortDescription: "",
        description: "",
        features: "50 dakikalık online seans\nVaka odaklı çalışma",
        icon: "user",
        price: "1500",
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
    <>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Hizmet Yönetimi</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Hizmetler veritabanından listelenir; ekleme, aktif/pasif ve silme buradan yapılır.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-navy-500" />}
          {canCreate && (
            <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-navy py-2 px-6 text-xs">
              <Plus className="h-4 w-4" /> Yeni Hizmet
            </button>
          )}
          <Link href="/hizmetler" target="_blank" rel="noreferrer" className="btn-outline-navy py-2 px-4 text-xs">
            <ExternalLink className="h-4 w-4" /> Sitede Gör
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {canCreate && showForm && (
        <div className="mb-10 card-premium border border-navy-100">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-navy-900">Yeni hizmet</h2>
          </div>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
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
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                placeholder="Fiyat"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="flex-1 rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                placeholder="Dakika"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-28 rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Veritabanına Kaydet"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-navy py-2 px-6 text-xs">
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="card-premium group">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-premium bg-navy-50 text-navy-900 transition-all duration-500 group-hover:bg-navy-900 group-hover:text-white">
                <ServiceIcon icon={s.icon} className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                    s.active
                      ? "border-green-100 bg-green-50 text-green-700"
                      : "border-clinical-border bg-clinical-light text-clinical-muted"
                  }`}
                >
                  {s.active ? "Aktif" : "Pasif"}
                </span>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => removeService(s.id)}
                    className="p-2 text-clinical-muted hover:text-red-600"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="mb-2 text-xl font-bold text-navy-900">{s.name}</h3>
            <p className="mb-1 font-mono text-xs text-clinical-muted">{s.slug}</p>
            <p className="mb-8 line-clamp-2 text-sm leading-relaxed text-clinical-muted">{s.description}</p>

            <div className="flex items-center justify-between border-t border-clinical-border pt-6">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  Başlangıç Ücreti
                </div>
                <div className="text-xl font-bold text-navy-900">{formatPrice(s.price)}</div>
              </div>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => toggleActive(s)}
                  className="btn-outline-navy py-2 px-4 text-[10px] font-bold uppercase tracking-widest"
                >
                  {s.active ? "Pasif Yap" : "Aktif Et"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && services.length === 0 && (
        <p className="mt-10 text-center text-sm text-clinical-muted">
          {canCreate
            ? "Henüz hizmet yok. \"Yeni Hizmet\" ile veritabanına ekleyin."
            : "Henüz hizmet kaydı yok."}
        </p>
      )}
    </>
  );
}
