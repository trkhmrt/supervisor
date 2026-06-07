"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Pencil } from "lucide-react";
import { ServiceFormFields } from "@/components/admin/ServiceFormFields";
import { canListServices, canUpdateServices } from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import {
  parseServiceFormPayload,
  serviceToForm,
  type ServiceFormData,
} from "@/lib/services/form";
import type { Service } from "@/lib/types";

export function ServiceEditView({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const user = useSessionUser()!;
  const canUpdate = canUpdateServices(user);

  const [service, setService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await panelFetch(user, `/api/panel/services/${serviceId}`);
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Hizmet yüklenemedi"));
      const data = (await r.json()) as Service;
      setService(data);
      setForm(serviceToForm(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hizmet yüklenemedi");
      setService(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [serviceId, user]);

  useEffect(() => {
    if (!canListServices(user)) {
      router.replace("/hizmetler");
      return;
    }
    if (!canUpdate) {
      router.replace("/dashboard/hizmetler");
      return;
    }
    void load();
  }, [canUpdate, load, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const r = await panelFetch(user, `/api/panel/services/${serviceId}`, {
        method: "PATCH",
        body: JSON.stringify(parseServiceFormPayload(form)),
      });
      if (!r.ok) throw new Error(await panelErrorMessage(r, "Güncellenemedi"));
      router.push("/dashboard/hizmetler");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-clinical-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Hizmet yükleniyor…
      </div>
    );
  }

  if (!service || !form) {
    return (
      <div>
        <p className="text-sm text-clinical-muted">{error ?? "Hizmet bulunamadı."}</p>
        <Link href="/dashboard/hizmetler" className="btn-outline-navy mt-4 inline-flex py-2 px-4 text-xs">
          Listeye dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <Link
          href="/dashboard/hizmetler"
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-clinical-muted hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Hizmet listesi
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="h2-premium text-3xl">Hizmeti Düzenle</h1>
            <p className="mt-2 text-sm text-clinical-muted">{service.name}</p>
          </div>
          <Link
            href={`/hizmetler/${service.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-navy inline-flex items-center gap-2 py-2 px-4 text-xs"
          >
            <ExternalLink className="h-4 w-4" />
            Sitede gör
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="card-premium border border-navy-100 max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
            <Pencil className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-navy-900">Hizmet bilgileri</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <ServiceFormFields form={form} setForm={setForm} showActive />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Değişiklikleri Kaydet"}
            </button>
            <Link href="/dashboard/hizmetler" className="btn-outline-navy py-2 px-6 text-xs">
              Vazgeç
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
