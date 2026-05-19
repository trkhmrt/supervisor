"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import Link from "next/link";
import { UserPlus, Mail, Check, Trash2, ShieldCheck, MoreVertical, Loader2, ChevronRight } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SupervisorApplicationsCard } from "@/components/admin/SupervisorApplicationsCard";
import { formatDate } from "@/lib/utils";
import type { Supervisor, SupervisorApplication, SupervisorInvite } from "@/lib/types";

async function fetchSupervisors(): Promise<Supervisor[]> {
  const r = await fetch("/api/admin/supervisors");
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function AdminSupervisors() {
  const [invites, setInvites] = useState<(SupervisorInvite & { inviteUrl?: string })[]>([]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [applications, setApplications] = useState<SupervisorApplication[]>([]);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"supervisors" | "applications" | "invites">("supervisors");
  const [supSearch, setSupSearch] = useState("");
  const [appStatus, setAppStatus] = useState("");
  const [appSearch, setAppSearch] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");

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
      const [data, invRes, appRes] = await Promise.all([
        fetchSupervisors(),
        fetch("/api/admin/invites", { credentials: "include" }),
        fetch("/api/admin/supervisor-applications", { credentials: "include" }),
      ]);
      setSupervisors(data);
      if (invRes.ok) {
        setInvites(await invRes.json());
      }
      if (appRes.ok) {
        setApplications(await appRes.json());
      } else {
        const appErr = (await appRes.json().catch(() => ({}))) as { error?: string };
        setApplications([]);
        if (appErr.error) {
          setError((prev) =>
            prev ? `${prev} · Talepler: ${appErr.error}` : `Süpervizör talepleri: ${appErr.error}`
          );
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Liste yüklenemedi");
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = (await res.json()) as { error?: string; inviteUrl?: string };
      if (!res.ok) throw new Error(j.error ?? "Davet gönderilemedi");
      setLastInviteUrl(j.inviteUrl ?? null);
      setEmail("");
      setSent(true);
      await reload();
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Davet gönderilemedi");
    }
  };

  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const expertise = form.expertise
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const r = await fetch("/api/admin/supervisors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(typeof j.error === "string" ? j.error : "Kayıt başarısız");
      }
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

  const filteredSupervisors = useMemo(() => {
    const q = supSearch.trim().toLowerCase();
    if (!q) return supervisors;
    return supervisors.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.expertise.some((e) => e.toLowerCase().includes(q))
    );
  }, [supervisors, supSearch]);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Bu süpervizörü silmek istediğinize emin misiniz?")) return;
    try {
      const r = await fetch(`/api/admin/supervisors/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      await reload();
    } catch {
      setError("Silinemedi");
    }
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <h1 className="h2-premium text-3xl">Süpervizör Yönetimi</h1>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-navy-500" />}
      </div>

      {error && (
        <div className="mb-6 rounded-premium border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium bg-navy-900 text-white border-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-premium flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Yeni Davet Gönder</h3>
            </div>
            <p className="text-navy-300 text-xs leading-relaxed mb-8">
              Süpervizör kayıtları davet usulü ile de yapılabilir. Adayın e-posta adresini girerek kayıt
              linki gönderin.
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                type="email"
                required
                placeholder="uzman@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-premium px-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-white/30"
              />
              <button type="submit" className="btn-white w-full py-3 text-xs">
                {sent ? <Check className="h-4 w-4" /> : "Davet Gönder"}
              </button>
              {lastInviteUrl && (
                <p className="mt-3 break-all text-[10px] text-navy-300">
                  Link: {lastInviteUrl}
                </p>
              )}
            </form>
          </div>

          <div className="card-premium border border-clinical-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-navy-50 rounded-premium flex items-center justify-center text-navy-900">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-navy-900">
                Veritabanına Süpervizör Ekle
              </h3>
            </div>
            <p className="text-clinical-muted text-xs leading-relaxed mb-6">
              Oluşturulan kayıt <strong className="text-navy-900">/supervizorler</strong> sayfasında listelenir.
            </p>
            <form onSubmit={handleCreateSupervisor} className="space-y-3">
              <input
                required
                placeholder="Ad Soyad"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Unvan (örn. Klinik Psikolog)"
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
                placeholder="Lisans / diploma no"
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
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Süpervizörü Kaydet"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <AdminTabBar
            active={tab}
            onChange={(id) => setTab(id as typeof tab)}
            tabs={[
              { id: "supervisors", label: "Süpervizörler", count: supervisors.length },
              { id: "applications", label: "Talepler", count: pendingAppCount || undefined },
              { id: "invites", label: "Davetler", count: invites.filter((i) => i.status === "pending").length || undefined },
            ]}
          />

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
                onInvite={async (id) => {
                  setInvitingId(id);
                  setError(null);
                  try {
                    const res = await fetch(`/api/admin/supervisor-applications/${id}/invite`, {
                      method: "POST",
                      credentials: "include",
                    });
                    const j = (await res.json()) as { error?: string; inviteUrl?: string };
                    if (!res.ok) throw new Error(j.error ?? "Davet gönderilemedi");
                    if (j.inviteUrl) setLastInviteUrl(j.inviteUrl);
                    await reload();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Davet gönderilemedi");
                  } finally {
                    setInvitingId(null);
                  }
                }}
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
              <div className="card-premium">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8">Davetler</h3>
            <div className="divide-y divide-clinical-border">
              {filteredInvites.length === 0 ? (
                <p className="py-8 text-center text-clinical-muted text-sm">Bekleyen davet bulunmuyor.</p>
              ) : (
                filteredInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-4 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-clinical-light rounded-full flex items-center justify-center text-navy-900">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy-900">{inv.email}</div>
                        <div className="text-[10px] text-clinical-muted uppercase font-bold tracking-widest mt-1">
                          {formatDate(inv.invitedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                          inv.status === "accepted"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {inv.status === "accepted" ? "Kabul Edildi" : "Bekliyor"}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/invites/${inv.id}`, {
                            method: "DELETE",
                            credentials: "include",
                          });
                          await reload();
                        }}
                        className="p-2 text-clinical-muted transition-colors hover:text-black"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
            </>
          )}

          {tab === "supervisors" && (
            <>
              <AdminFilterBar
                search={supSearch}
                onSearchChange={setSupSearch}
                searchPlaceholder="Ad, unvan veya uzmanlık ara…"
              />
              <div className="card-premium">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest">Kayıtlı Süpervizörler</h3>
              <a href="/supervizorler" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-navy-500 hover:text-navy-900 uppercase tracking-widest">
                Siteyi aç →
              </a>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredSupervisors.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 bg-clinical-light rounded-premium border border-clinical-border group hover:border-navy-900 transition-all"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white shadow-sm">
                    <img src={s.photo} alt={s.fullName} className="object-cover w-full h-full" />
                  </div>
                  <Link href={`/admin/supervizorler/${s.id}`} className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-navy-900 truncate group-hover:underline">{s.fullName}</div>
                    <div className="text-[10px] text-clinical-muted font-bold uppercase tracking-widest truncate">
                      {s.title}
                    </div>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/supervizorler/${s.id}`} className="p-2 text-navy-600 hover:text-navy-900" title="Detay">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-clinical-muted hover:text-red-600"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!loading && filteredSupervisors.length === 0 && (
              <p className="mt-6 text-center text-sm text-clinical-muted">
                {supervisors.length === 0
                  ? "Henüz süpervizör yok."
                  : "Filtreye uygun süpervizör bulunamadı."}
              </p>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
