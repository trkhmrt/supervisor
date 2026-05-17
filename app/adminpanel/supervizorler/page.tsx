"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { Supervisor } from "@/lib/types";

const emptyForm = {
  fullName: "",
  title: "",
  photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  bio: "",
  license: "",
  pricePerSession: "1500",
  expertise: "Bireysel Terapi",
  languages: "Türkçe",
  accountEmail: "",
  accountPassword: "",
};

export default function AdminSupervisorsPage() {
  const [list, setList] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/supervisors", { credentials: "include" });
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/supervisors", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          title: form.title,
          photo: form.photo,
          bio: form.bio,
          license: form.license,
          pricePerSession: Number(form.pricePerSession),
          expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
          languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
          accountEmail: form.accountEmail,
          accountPassword: form.accountPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Oluşturulamadı.");
      setShowForm(false);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-premium text-3xl">Süpervizörler</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Panelden oluşturulan hesaplar <strong>supervisor</strong> rolü alır.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-premium bg-navy-900 text-white px-5 py-2.5 text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          Yeni Süpervizör
        </button>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium p-4">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
        </div>
      ) : (
        <div className="card-premium overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-clinical-border text-left text-xs uppercase tracking-widest text-clinical-muted">
                <th className="pb-3 pr-4">Ad</th>
                <th className="pb-3 pr-4">Unvan</th>
                <th className="pb-3 pr-4">Ücret</th>
                <th className="pb-3">ID</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-clinical-border/60 last:border-0">
                  <td className="py-4 pr-4 font-semibold text-navy-900">{s.fullName}</td>
                  <td className="py-4 pr-4 text-clinical-muted">{s.title}</td>
                  <td className="py-4 pr-4">{s.pricePerSession} {s.currency}</td>
                  <td className="py-4 text-xs text-clinical-muted font-mono">{s.id}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-clinical-muted">
                    Henüz süpervizör yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-premium border border-clinical-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-navy-900">Süpervizör + Hesap</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Kapat">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <Field label="Ad Soyad" value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} />
              <Field label="Unvan" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
              <Field label="Foto URL" value={form.photo} onChange={(v) => setForm((f) => ({ ...f, photo: v }))} />
              <label className="block text-xs font-bold uppercase text-navy-900">
                Biyografi
                <textarea
                  required
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="mt-1 w-full rounded-premium border border-clinical-border p-3 text-sm"
                />
              </label>
              <Field label="Lisans" value={form.license} onChange={(v) => setForm((f) => ({ ...f, license: v }))} />
              <Field label="Seans ücreti" value={form.pricePerSession} onChange={(v) => setForm((f) => ({ ...f, pricePerSession: v }))} type="number" />
              <Field label="Uzmanlık (virgülle)" value={form.expertise} onChange={(v) => setForm((f) => ({ ...f, expertise: v }))} />
              <Field label="Diller (virgülle)" value={form.languages} onChange={(v) => setForm((f) => ({ ...f, languages: v }))} />
              <hr className="border-clinical-border" />
              <p className="text-xs text-clinical-muted">Giriş hesabı (supervisor rolü)</p>
              <Field label="Hesap e-posta" value={form.accountEmail} onChange={(v) => setForm((f) => ({ ...f, accountEmail: v }))} type="email" />
              <Field label="Hesap şifre" value={form.accountPassword} onChange={(v) => setForm((f) => ({ ...f, accountPassword: v }))} type="password" />
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-premium bg-navy-900 text-white py-3 text-sm font-bold disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : "Oluştur"}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-xs font-bold uppercase text-navy-900">
      {label}
      <input
        required={type !== "number"}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
    </label>
  );
}
