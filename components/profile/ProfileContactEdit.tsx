"use client";

import { useState } from "react";
import { Loader2, Phone } from "lucide-react";
import { USER_PROFESSIONS } from "@/lib/constants/user-professions";
import { isValidPhone, normalizePhone } from "@/lib/validation/phone";
import { useAppStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

export function ProfileContactEdit({ user }: { user: SessionUser }) {
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [profession, setProfession] = useState(user.profession ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!isValidPhone(phone)) {
      setError("Geçerli bir telefon numarası girin.");
      return;
    }
    if (!profession.trim()) {
      setError("Mesleki rolünüzü seçin.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizePhone(phone),
          profession,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi");
      setAuthUser(data as SessionUser);
      setMessage("Profil güncellendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border-t border-clinical-border pt-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-navy-900 mb-4">
        İletişim Bilgileri
      </h3>
      <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-500">
            <Phone className="h-3.5 w-3.5" />
            Telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-navy-500">
            Mesleki rol
          </label>
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm"
          >
            <option value="">Seçiniz</option>
            {USER_PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-navy py-2 px-6 text-xs disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
          </button>
          {message && <span className="text-sm text-green-700">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </section>
  );
}
