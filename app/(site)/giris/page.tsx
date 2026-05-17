"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { authErrorMessage, signInWithEmail } from "@/lib/auth/client";
import { redirectPathForRole } from "@/lib/auth/redirect";
import { useAppStore, useCurrentUser } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const authReady = useAppStore((s) => s.authReady);
  const user = useCurrentUser();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth_callback") {
      setError("Google ile giriş tamamlanamadı. Lütfen tekrar deneyin.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authReady || !user) return;
    router.replace(redirectPathForRole(user.role));
  }, [authReady, user, router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithEmail(form.email, form.password);
      if (!user) {
        setError("E-posta veya şifre hatalı.");
        return;
      }
      setAuthUser(user);
      router.replace(redirectPathForRole(user.role));
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-20 pb-12">
      <div className="container-wide flex justify-center">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-premium shadow-2xl overflow-hidden border border-clinical-border">
          <div className="hidden lg:flex bg-navy-900 text-white p-16 flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-3 mb-16">
                <div className="w-10 h-10 bg-white rounded-premium flex items-center justify-center text-navy-900">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="font-display text-xl font-bold tracking-tight">Süpervizyon</span>
              </Link>
              <h2 className="text-4xl font-display font-bold mb-6 leading-tight">
                Klinik Gelişiminize <br /> Kaldığınız Yerden <br /> Devam Edin
              </h2>
              <p className="text-navy-300 leading-relaxed max-w-xs">
                E-posta ve şifre veya Google hesabınızla güvenli giriş yapın.
              </p>
            </div>
            <p className="relative z-10 pt-12 border-t border-white/10 text-xs text-navy-300">
              Oturum Supabase Auth ile yönetilir.
            </p>
          </div>

          <div className="p-12 md:p-16">
            <Reveal>
              <h1 className="h2-premium mb-2">Giriş Yap</h1>
              <p className="text-clinical-muted text-sm mb-8">Hesap bilgileriniz veya Google ile giriş.</p>
            </Reveal>

            <GoogleAuthButton />

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-clinical-border" />
              <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">veya</span>
              <div className="h-px flex-1 bg-clinical-border" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="ornek@email.com"
                    className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-premium bg-[#f1f0f0] p-4 text-sm text-black">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-navy w-full py-4 text-base disabled:opacity-60">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Giriş yapılıyor…
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center text-sm text-clinical-muted">
                Hesabınız yok mu?{" "}
                <Link href="/kayit" className="font-bold text-navy-900 hover:text-accent-blue transition-colors">
                  Kayıt olun
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-clinical-light" />}>
      <LoginForm />
    </Suspense>
  );
}
