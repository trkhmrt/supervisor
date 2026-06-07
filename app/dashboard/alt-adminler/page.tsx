"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { hasUserScope } from "@/lib/auth/access";
import { useSessionUser } from "@/hooks/useSessionUser";

type AdminRow = {
  id: number;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  scopes: string[];
  createdAt: string;
};

type Permission = { id: string; key: string; description: string };

type MeInfo = { id: number };

type FormState = {
  email: string;
  password: string;
  fullName: string;
  isSuperAdmin: boolean;
  scopes: string[];
};

const emptyForm: FormState = {
  email: "",
  password: "",
  fullName: "",
  isSuperAdmin: false,
  scopes: [],
};

export default function AdminUsersPage() {
  const sessionUser = useSessionUser();
  const [list, setList] = useState<AdminRow[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [me, setMe] = useState<MeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const canCreate = hasUserScope(sessionUser, "admins:create");
  const canUpdate = hasUserScope(sessionUser, "admins:update");
  const canDelete = hasUserScope(sessionUser, "admins:delete");

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
      const meData = await meRes.json();
      if (!adminsRes.ok) throw new Error(admins.error ?? "Liste alınamadı.");
      setList(admins);
      if (permsRes.ok) setPermissions(perms);
      if (meRes.ok) setMe({ id: meData.id });
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
    setModalMode("create");
    setEditingId(null);
    setForm(emptyForm);
  }

  function openEdit(admin: AdminRow) {
    setModalMode("edit");
    setEditingId(admin.id);
    setForm({
      email: admin.email,
      password: "",
      fullName: admin.fullName,
      isSuperAdmin: admin.isSuperAdmin,
      scopes: admin.isSuperAdmin ? [] : [...admin.scopes],
    });
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
    setForm(emptyForm);
  }

  function toggleScope(key: string) {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(key) ? f.scopes.filter((s) => s !== key) : [...f.scopes, key],
    }));
  }

  function canEditAdmin(admin: AdminRow): boolean {
    if (!canUpdate) return false;
    if (admin.isSuperAdmin && !sessionUser?.isSuperAdmin) return false;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (modalMode === "create") {
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
      } else if (modalMode === "edit" && editingId !== null) {
        const payload: Record<string, unknown> = {
          fullName: form.fullName,
          isSuperAdmin: form.isSuperAdmin,
        };
        if (form.password.trim()) payload.password = form.password;
        if (!form.isSuperAdmin) payload.scopes = form.scopes;

        const res = await fetch(`/api/adminpanel/admins/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Güncellenemedi.");
      }
      closeModal();
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
  const editingSelf = editingId !== null && editingId === me?.id;

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-premium text-3xl">Alt Adminler</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Scope ile süpervizör, hizmet ve admin işlemlerine ince ayarlı yetki verin.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-premium bg-navy-900 text-white px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            Alt Admin Ekle
          </button>
        )}
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium p-4">
          {error}
        </p>
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
              <div className="flex items-center gap-1">
                {canEditAdmin(a) && (
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="text-navy-900 hover:bg-navy-50 p-2 rounded-premium"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {canDelete && a.id !== me?.id && !a.isSuperAdmin && (
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
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-center text-clinical-muted py-8">Henüz alt admin yok.</p>
          )}
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-premium border border-clinical-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-navy-900">
                {modalMode === "create" ? "Alt Admin Ekle" : "Alt Admin Düzenle"}
              </h2>
              <button type="button" onClick={closeModal} aria-label="Kapat">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <Field
                label="Ad Soyad"
                value={form.fullName}
                onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
                required
              />
              {modalMode === "create" ? (
                <Field
                  label="E-posta"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  type="email"
                  required
                />
              ) : (
                <label className="block text-xs font-bold uppercase text-navy-900">
                  E-posta
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="mt-1 w-full rounded-premium border border-clinical-border bg-clinical-light px-3 py-2 text-sm text-clinical-muted"
                  />
                </label>
              )}
              <Field
                label={modalMode === "edit" ? "Yeni şifre (opsiyonel)" : "Şifre"}
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                type="password"
                required={modalMode === "create"}
                placeholder={modalMode === "edit" ? "Değiştirmek için doldurun" : undefined}
              />
              {(sessionUser?.isSuperAdmin || modalMode === "create") && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isSuperAdmin}
                    disabled={editingSelf}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isSuperAdmin: e.target.checked,
                        scopes: e.target.checked ? [] : f.scopes,
                      }))
                    }
                  />
                  Süper admin (tüm scope&apos;lar)
                  {editingSelf && (
                    <span className="text-xs text-clinical-muted">(kendi hesabınız)</span>
                  )}
                </label>
              )}
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
                      Admin yönetimi için en az: admins:list, admins:create, admins:update,
                      admins:delete
                    </p>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-premium bg-navy-900 text-white py-3 text-sm font-bold disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : modalMode === "create" ? "Oluştur" : "Kaydet"}
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
  required = true,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-bold uppercase text-navy-900">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      />
    </label>
  );
}
