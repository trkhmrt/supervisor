"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { AdDisplayMode, Advertisement } from "@/lib/types";

type FormState = {
  id: string | null;
  title: string;
  body: string;
  imageUrl: string;
  linkUrl: string;
  displayMode: AdDisplayMode;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: FormState = {
  id: null,
  title: "",
  body: "",
  imageUrl: "",
  linkUrl: "",
  displayMode: "IMAGE_WITH_TEXT",
  active: true,
  startsAt: "",
  endsAt: "",
};

function toFormState(ad: Advertisement): FormState {
  return {
    id: ad.id,
    title: ad.title,
    body: ad.body ?? "",
    imageUrl: ad.imageUrl,
    linkUrl: ad.linkUrl ?? "",
    displayMode: ad.displayMode,
    active: ad.active,
    startsAt: ad.startsAt ? toLocalDatetime(ad.startsAt) : "",
    endsAt: ad.endsAt ? toLocalDatetime(ad.endsAt) : "",
  };
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetime(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export default function AdsPage() {
  const [list, setList] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/ads", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Liste alınamadı.");
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(ad: Advertisement) {
    setForm(toFormState(ad));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        body: form.body || null,
        imageUrl: form.imageUrl,
        linkUrl: form.linkUrl || null,
        displayMode: form.displayMode,
        active: form.active,
        startsAt: fromLocalDatetime(form.startsAt),
        endsAt: fromLocalDatetime(form.endsAt),
      };

      const res = await fetch(
        form.id ? `/api/adminpanel/ads/${form.id}` : "/api/adminpanel/ads",
        {
          method: form.id ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kayıt yapılamadı.");
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu reklam silinsin mi?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/adminpanel/ads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    }
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-premium text-3xl">Reklamlar</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Site geneline yayınlanan popup reklamlarını buradan yönetin. Aktif olan reklam
            ziyaretçilere bir kez gösterilir; kapatıldıktan sonra tekrar açılmaz.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-premium bg-navy-900 px-5 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Reklam
        </button>
      </div>

      {error && (
        <p className="mb-6 rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-premium border border-clinical-border bg-white p-8 text-center text-clinical-muted">
          Henüz reklam eklenmedi.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((ad) => (
            <div key={ad.id} className="card-premium">
              <div className="relative aspect-[4/3] overflow-hidden rounded-premium border border-clinical-border">
                <Image
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy-900">{ad.title}</h3>
                    {ad.active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-clinical-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                        Pasif
                      </span>
                    )}
                  </div>
                  {ad.body && (
                    <p className="mt-2 line-clamp-2 text-sm text-clinical-muted">{ad.body}</p>
                  )}
                  <p className="mt-2 text-[11px] uppercase tracking-widest text-clinical-muted">
                    {ad.displayMode === "IMAGE_ONLY" ? "Sadece Görsel" : "Görsel + Yazı"}
                    {ad.linkUrl && " · Tıklanabilir"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(ad)}
                    className="rounded-premium p-2 text-navy-700 hover:bg-clinical-light"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(ad.id)}
                    className="rounded-premium p-2 text-red-600 hover:bg-red-50"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-premium border border-clinical-border bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900">
                {form.id ? "Reklamı Düzenle" : "Yeni Reklam"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Kapat">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <Field
                label="Başlık"
                value={form.title}
                onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                required
              />
              <Field
                label="Görsel URL"
                value={form.imageUrl}
                onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
                required
                placeholder="https://..."
              />
              <Field
                label="Açıklama (opsiyonel)"
                value={form.body}
                onChange={(v) => setForm((f) => ({ ...f, body: v }))}
                multiline
              />
              <Field
                label="Tıklanınca gidilecek link (opsiyonel)"
                value={form.linkUrl}
                onChange={(v) => setForm((f) => ({ ...f, linkUrl: v }))}
                placeholder="https://veya /sayfa"
              />

              <div>
                <p className="mb-2 text-xs font-bold uppercase text-navy-900">Görüntülenme Modu</p>
                <div className="flex gap-3">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-premium border border-clinical-border p-3 text-sm">
                    <input
                      type="radio"
                      checked={form.displayMode === "IMAGE_WITH_TEXT"}
                      onChange={() => setForm((f) => ({ ...f, displayMode: "IMAGE_WITH_TEXT" }))}
                    />
                    Görsel + Yazı
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-premium border border-clinical-border p-3 text-sm">
                    <input
                      type="radio"
                      checked={form.displayMode === "IMAGE_ONLY"}
                      onChange={() => setForm((f) => ({ ...f, displayMode: "IMAGE_ONLY" }))}
                    />
                    Sadece Görsel
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Başlangıç tarihi (opsiyonel)"
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(v) => setForm((f) => ({ ...f, startsAt: v }))}
                />
                <Field
                  label="Bitiş tarihi (opsiyonel)"
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(v) => setForm((f) => ({ ...f, endsAt: v }))}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-navy-900">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                />
                Aktif (kullanıcılara göster)
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-premium bg-navy-900 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : form.id ? "Güncelle" : "Oluştur"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-navy-900">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="mt-1 w-full resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}
