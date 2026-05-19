"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

type AdminRow = {
  id: number;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  scopes: string[];
  createdAt: string;
};

type Permission = { id: string; key: string; description: string };

const emptyForm = {
  email: "",
  password: "",
  fullName: "",
  isSuperAdmin: false,
  scopes: [] as string[],
};

export default function AdminUsersPage() {
  const [list, setList] = useState<AdminRow[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [meId, setMeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminsRes, permsRes, meRes] = await Promise.all([
        fetch("/api/adminpanel/admins", { credentials: "include" }),
        fetch("/api/adminpanel/permissions", { credentials: "include" }),
        fetch("/api/auth/me", { credentials: "include" }),
      ]);
      const admins = await adminsRes.json();
      const perms = await permsRes.json();
      const me = await meRes.json();
      if (!adminsRes.ok) throw new Error(admins.error ?? "Liste alınamadı.");
      setList(admins);
      if (permsRes.ok) setPermissions(perms);
      if (meRes.ok) setMeId(me.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleScope(key: string) {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(key) ? f.scopes.filter((s) => s !== key) : [...f.scopes, key],
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/admins", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          isSuperAdmin: form.isSuperAdmin,
          scopes: form.isSuperAdmin ? undefined : form.scopes,
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

  async function handleDelete(id: number) {
    if (!confirm("Bu alt admin silinsin mi?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/adminpanel/admins/${id}`, {
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

  const adminScopes = permissions.filter((p) => p.key.startsWith("admins:"));

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-premium text-3xl">Alt Adminler</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Scope ile süpervizör, hizmet ve admin işlemlerine ince ayarlı yetki verin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-premium bg-navy-900 text-white px-5 py-2.5 text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          Alt Admin Ekle
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
        <div className="space-y-4">
          {list.map((a) => (
            <div key={a.id} className="card-premium flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-navy-900">{a.fullName}</p>
                <p className="text-sm text-clinical-muted">{a.email}</p>
                <p className="text-xs mt-2 text-clinical-muted">
                  {a.isSuperAdmin
                    ? "Süper admin — tüm yetkiler"
                    : a.scopes.length
                      ? a.scopes.join(", ")
                      : "Yetki atanmamış"}
                </p>
              </div>
              {a.id !== meId && !a.isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => void handleDelete(a.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-premium"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-center text-clinical-muted py-8">Henüz alt admin yok.</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-premium border border-clinical-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-navy-900">Alt Admin</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Kapat">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <Field label="Ad Soyad" value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} />
              <Field label="E-posta" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" />
              <Field label="Şifre" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} type="password" />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isSuperAdmin}
                  onChange={(e) => setForm((f) => ({ ...f, isSuperAdmin: e.target.checked }))}
                />
                Süper admin (tüm scope&apos;lar)
              </label>
              {!form.isSuperAdmin && (
                <div>
                  <p className="text-xs font-bold uppercase text-navy-900 mb-2">Yetkiler</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-clinical-border rounded-premium p-3">
                    {permissions.map((p) => (
                      <label key={p.id} className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.scopes.includes(p.key)}
                          onChange={() => toggleScope(p.key)}
                        />
                        <span>
                          <span className="font-mono text-xs">{p.key}</span>
                          <span className="block text-clinical-muted text-xs">{p.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {adminScopes.length > 0 && (
                    <p className="text-xs text-clinical-muted mt-2">
                      Admin yönetimi için en az: admins:list, admins:create, admins:update, admins:delete
                    </p>
                  )}
                </div>
              )}
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
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
    </label>
  );
}
