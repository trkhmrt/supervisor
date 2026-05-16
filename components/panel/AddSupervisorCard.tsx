"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Loader2, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { User } from "@/lib/types";

export function AddSupervisorCard({ user }: { user: User }) {
  const upsertSupervisor = useAppStore((s) => s.upsertSupervisor);
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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const expertise = form.expertise
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const r = await fetch("/api/panel/supervisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "x-user-role": user.role,
        },
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
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(typeof j.error === "string" ? j.error : "Kayıt başarısız");
      }
      upsertSupervisor(j);
      setMsg({ type: "ok", text: "Süpervizör kaydedildi; sitede listelenir." });
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
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Hata oluştu" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-premium border border-navy-100 bg-navy-50/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-navy-900 rounded-premium flex items-center justify-center text-white">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-navy-900 text-sm uppercase tracking-widest">Süpervizör ekle</h3>
          <p className="text-[11px] text-clinical-muted mt-0.5">
            Veritabanına kayıt oluşturulur;{" "}
            <Link href="/supervizorler" className="font-bold text-navy-700 underline-offset-2 hover:underline">
              süpervizörler
            </Link>{" "}
            sayfasında görünür.
          </p>
        </div>
      </div>

      {msg && (
        <div
          className={`mb-4 rounded-premium px-3 py-2 text-xs font-medium ${
            msg.type === "ok" ? "bg-green-50 text-green-800 border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
          }`}
        >
          {msg.type === "ok" && <Check className="inline h-3.5 w-3.5 mr-1 align-text-bottom" />}
          {msg.text}
        </div>
      )}

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Ad Soyad"
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
          className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Unvan"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Fotoğraf URL"
          value={form.photo}
          onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value }))}
          className="sm:col-span-2 rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder="Biyografi"
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          className="sm:col-span-2 h-20 resize-none rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Lisans"
          value={form.license}
          onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
          className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Uzmanlıklar (virgülle)"
          value={form.expertise}
          onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))}
          className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Seans ücreti (TRY)"
          value={form.pricePerSession}
          onChange={(e) => setForm((f) => ({ ...f, pricePerSession: e.target.value }))}
          className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          placeholder="Yıl tecrübe"
          value={form.yearsExperience}
          onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
          className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
        />
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-navy w-full py-3 text-xs sm:w-auto sm:px-8">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
