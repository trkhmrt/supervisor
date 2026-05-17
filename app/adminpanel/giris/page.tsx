"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { fetchSessionUser } from "@/lib/auth/client";
import { useAppStore } from "@/lib/store";

export default function AdminPanelLoginPage() {
  const router = useRouter();
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Giriş başarısız.");
        return;
      }
      const sessionUser = await fetchSessionUser();
      if (sessionUser) setAuthUser(sessionUser);
      router.replace("/adminpanel");
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-clinical-light flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-premium border border-clinical-border shadow-xl p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-navy-900 rounded-premium flex items-center justify-center text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">Admin Panel</h1>
            <p className="text-xs text-clinical-muted mt-1">E-posta ve şifre ile giriş</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-premium bg-red-50 border border-red-100 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-navy-900">E-posta</span>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-muted" />
              <input
                type="email"
                required
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border py-3 pl-11 pr-4 text-sm"
                placeholder="admin@ornek.com"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-navy-900">Şifre</span>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-muted" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-premium border border-clinical-border py-3 pl-11 pr-4 text-sm"
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-premium bg-navy-900 text-white py-3 text-sm font-bold disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Giriş Yap
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-clinical-muted">
          <Link href="/" className="text-navy-700 font-semibold hover:underline">
            Siteye dön
          </Link>
          {" · "}
          Google ile giriş bu panelde kullanılmaz.
        </p>
      </div>
    </section>
  );
}
