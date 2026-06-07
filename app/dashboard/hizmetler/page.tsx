"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Layers, Plus, Loader2, Trash2, ExternalLink, Pencil } from "lucide-react";
import { ServiceFormFields } from "@/components/admin/ServiceFormFields";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import {
  canCreateServices,
  canDeleteServices,
  canListServices,
  canUpdateServices,
} from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import { EMPTY_SERVICE_FORM, parseServiceFormPayload, type ServiceFormData } from "@/lib/services/form";
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
  const [form, setForm] = useState<ServiceFormData>(EMPTY_SERVICE_FORM);

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

  const toggleGroupService = async (s: Service) => {
    try {
      const r = await panelFetch(user, `/api/panel/services/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isGroupService: !s.isGroupService }),
      });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Güncellenemedi"));
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi");
    }
  };

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
    try {
      const r = await panelFetch(user, "/api/panel/services", {
        method: "POST",
        body: JSON.stringify(parseServiceFormPayload(form)),
      });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Kayıt başarısız"));
      setForm(EMPTY_SERVICE_FORM);
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
            Hizmetleri ekleyin, düzenleyin, aktif/pasif yapın veya silin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-navy-500" />}
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_SERVICE_FORM);
                setShowForm((v) => !v);
              }}
              className="btn-navy py-2 px-6 text-xs"
            >
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
            <ServiceFormFields form={form} setForm={setForm} />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Veritabanına Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-outline-navy py-2 px-6 text-xs"
              >
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
                    s.isGroupService
                      ? "border-violet-100 bg-violet-50 text-violet-700"
                      : "border-clinical-border bg-clinical-light text-clinical-muted"
                  }`}
                >
                  {s.isGroupService ? "Grup" : "Bireysel"}
                </span>
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
              <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                {s.duration} dk · {s.price > 0 ? `${s.price} ₺` : "Ücretsiz"}
              </span>
              {canUpdate && (
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    href={`/dashboard/hizmetler/${s.id}/duzenle`}
                    className="btn-navy inline-flex items-center gap-1.5 py-2 px-4 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Düzenle
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleGroupService(s)}
                    className="btn-outline-navy py-2 px-4 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {s.isGroupService ? "Bireysel Yap" : "Grup Yap"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(s)}
                    className="btn-outline-navy py-2 px-4 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {s.active ? "Pasif Yap" : "Aktif Et"}
                  </button>
                </div>
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
