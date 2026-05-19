"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, X, Mail, ChevronRight } from "lucide-react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { SupervisorApplicationsCard } from "@/components/admin/SupervisorApplicationsCard";
import { formatDate } from "@/lib/utils";
import type { Supervisor, SupervisorApplication, SupervisorInvite } from "@/lib/types";

type TabId = "supervisors" | "applications" | "invites";

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

export function AdminSupervisorsPage() {
  const [tab, setTab] = useState<TabId>("supervisors");
  const [list, setList] = useState<Supervisor[]>([]);
  const [applications, setApplications] = useState<SupervisorApplication[]>([]);
  const [invites, setInvites] = useState<SupervisorInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  const [supSearch, setSupSearch] = useState("");
  const [appStatus, setAppStatus] = useState("");
  const [appSearch, setAppSearch] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [supRes, appRes, invRes] = await Promise.all([
        fetch("/api/adminpanel/supervisors", { credentials: "include" }),
        fetch("/api/admin/supervisor-applications", { credentials: "include" }),
        fetch("/api/admin/invites", { credentials: "include" }),
      ]);
      const data = await supRes.json();
      if (!supRes.ok) throw new Error(data.error ?? "Liste alınamadı.");
      setList(data);
      if (appRes.ok) setApplications(await appRes.json());
      else setApplications([]);
      if (invRes.ok) setInvites(await invRes.json());
      else setInvites([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredSupervisors = useMemo(() => {
    const q = supSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.expertise.some((e) => e.toLowerCase().includes(q)) ||
        s.id.toLowerCase().includes(q)
    );
  }, [list, supSearch]);

  const filteredApplications = useMemo(() => {
    let items = applications;
    if (appStatus) items = items.filter((a) => a.status === appStatus);
    const q = appSearch.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.message?.toLowerCase().includes(q) ?? false)
      );
    }
    return items;
  }, [applications, appStatus, appSearch]);

  const filteredInvites = useMemo(() => {
    if (!inviteStatus) return invites;
    return invites.filter((i) => i.status === inviteStatus);
  }, [invites, inviteStatus]);

  const pendingAppCount = applications.filter((a) => a.status === "pending").length;

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
      setTab("supervisors");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  async function sendInvite(id: string) {
    setInvitingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/supervisor-applications/${id}/invite`, {
        method: "POST",
        credentials: "include",
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Davet gönderilemedi");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Davet gönderilemedi");
    } finally {
      setInvitingId(null);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-premium text-3xl">Süpervizörler</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Kayıtlı süpervizörler, başvuru talepleri ve davetler.
          </p>
        </div>
        {tab === "supervisors" && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-premium bg-navy-900 text-white px-5 py-2.5 text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            Yeni Süpervizör
          </button>
        )}
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium p-4">
          {error}
        </p>
      )}

      <AdminTabBar
        active={tab}
        onChange={(id) => setTab(id as TabId)}
        tabs={[
          { id: "supervisors", label: "Süpervizörler", count: list.length },
          { id: "applications", label: "Talepler", count: pendingAppCount || undefined },
          { id: "invites", label: "Davetler", count: invites.filter((i) => i.status === "pending").length || undefined },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
        </div>
      ) : (
        <>
          {tab === "supervisors" && (
            <>
              <AdminFilterBar
                search={supSearch}
                onSearchChange={setSupSearch}
                searchPlaceholder="Ad, unvan veya uzmanlık ara…"
              />
              <div className="card-premium overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-clinical-border text-left text-xs uppercase tracking-widest text-clinical-muted">
                      <th className="pb-3 pr-4">Ad</th>
                      <th className="pb-3 pr-4">Unvan</th>
                      <th className="pb-3 pr-4">Ücret</th>
                      <th className="pb-3 pr-4">ID</th>
                      <th className="pb-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupervisors.map((s) => (
                      <tr key={s.id} className="border-b border-clinical-border/60 last:border-0 hover:bg-clinical-light/50">
                        <td className="py-4 pr-4">
                          <Link
                            href={`/dashboard/supervizorler/${s.id}`}
                            className="font-semibold text-navy-900 hover:underline"
                          >
                            {s.fullName}
                          </Link>
                        </td>
                        <td className="py-4 pr-4 text-clinical-muted">{s.title}</td>
                        <td className="py-4 pr-4">
                          {s.pricePerSession} {s.currency}
                        </td>
                        <td className="py-4 text-xs text-clinical-muted font-mono">{s.id}</td>
                        <td className="py-4">
                          <Link
                            href={`/dashboard/supervizorler/${s.id}`}
                            className="inline-flex text-navy-600 hover:text-navy-900"
                            aria-label="Detay"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredSupervisors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-clinical-muted">
                          Sonuç bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "applications" && (
            <>
              <AdminFilterBar
                search={appSearch}
                onSearchChange={setAppSearch}
                searchPlaceholder="Ad veya e-posta ara…"
                selectLabel="Durum"
                selectValue={appStatus}
                selectOptions={[
                  { value: "", label: "Tümü" },
                  { value: "pending", label: "Bekliyor" },
                  { value: "invited", label: "Davet gönderildi" },
                  { value: "rejected", label: "Reddedildi" },
                ]}
                onSelectChange={setAppStatus}
              />
              <SupervisorApplicationsCard
                embedded
                applications={filteredApplications}
                invitingId={invitingId}
                onInvite={sendInvite}
              />
            </>
          )}

          {tab === "invites" && (
            <>
              <div className="mb-6 max-w-xs">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  Durum
                </label>
                <select
                  value={inviteStatus}
                  onChange={(e) => setInviteStatus(e.target.value)}
                  className="w-full rounded-premium border border-clinical-border px-3 py-2.5 text-sm"
                >
                  <option value="">Tümü</option>
                  <option value="pending">Bekliyor</option>
                  <option value="accepted">Kabul edildi</option>
                  <option value="expired">Süresi doldu</option>
                </select>
              </div>
              <div className="card-premium divide-y divide-clinical-border">
                {filteredInvites.length === 0 ? (
                  <p className="py-8 text-center text-clinical-muted text-sm">Davet bulunamadı.</p>
                ) : (
                  filteredInvites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-light">
                          <Mail className="h-4 w-4 text-navy-900" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy-900">{inv.email}</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                            {formatDate(inv.invitedAt)}
                            {inv.expiresAt && ` · Son: ${formatDate(inv.expiresAt)}`}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                          inv.status === "accepted"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : inv.status === "expired"
                              ? "bg-gray-50 text-gray-600 border-gray-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {inv.status === "accepted"
                          ? "Kabul"
                          : inv.status === "expired"
                            ? "Süresi doldu"
                            : "Bekliyor"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
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
