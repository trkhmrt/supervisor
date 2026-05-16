"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, Mail, Check, Trash2, ShieldCheck, MoreVertical, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { Supervisor } from "@/lib/types";

async function fetchSupervisors(): Promise<Supervisor[]> {
  const r = await fetch("/api/admin/supervisors");
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function AdminSupervisors() {
  const invites = useAppStore((s) => s.invites);
  const inviteSupervisor = useAppStore((s) => s.inviteSupervisor);
  const removeInvite = useAppStore((s) => s.removeInvite);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
      const data = await fetchSupervisors();
      setSupervisors(data);
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

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    inviteSupervisor(email);
    setEmail("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
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
          <div className="card-premium">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8">Bekleyen Davetler</h3>
            <div className="divide-y divide-clinical-border">
              {invites.length === 0 ? (
                <p className="py-8 text-center text-clinical-muted text-sm">Bekleyen davet bulunmuyor.</p>
              ) : (
                invites.map((inv) => (
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
                        onClick={() => removeInvite(inv.id)}
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

          <div className="mt-8 card-premium">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest">Kayıtlı Süpervizörler</h3>
              <a href="/supervizorler" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-navy-500 hover:text-navy-900 uppercase tracking-widest">
                Siteyi aç →
              </a>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {supervisors.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 bg-clinical-light rounded-premium border border-clinical-border group hover:border-navy-900 transition-all"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white shadow-sm">
                    <img src={s.photo} alt={s.fullName} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-navy-900 truncate">{s.fullName}</div>
                    <div className="text-[10px] text-clinical-muted font-bold uppercase tracking-widest truncate">
                      {s.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-clinical-muted hover:text-red-600"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="p-2 text-clinical-muted">
                      <MoreVertical className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {!loading && supervisors.length === 0 && (
              <p className="mt-6 text-center text-sm text-clinical-muted">
                Henüz süpervizör yok. Veritabanı bağlantısı yoksa önce .env.local içinde DATABASE_URL ayarlayın.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
