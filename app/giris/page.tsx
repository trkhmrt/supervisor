"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/motion/Reveal";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const login = useAppStore((s) => s.login);
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  return (
    <SiteShell>
      <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-20 pb-12">
        <div className="container-wide flex justify-center">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-premium shadow-2xl overflow-hidden border border-clinical-border">
            {/* Left Side - Info */}
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
                    Hesabınıza giriş yaparak randevularınızı yönetin ve uzman kadromuzla 
                    iletişimde kalın.
                  </p>
               </div>
               
               <div className="relative z-10 pt-12 border-t border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-navy-400 mb-4">Demo Giriş Bilgileri</div>
                  <div className="space-y-3 text-xs text-navy-200">
                     <p><span className="font-bold text-white">Danışan:</span> zeynep@example.com / demo1234</p>
                     <p><span className="font-bold text-white">Süpervizör:</span> abdullatif@supervizyon.com / supervisor123</p>
                     <p><span className="font-bold text-white">Admin:</span> admin@supervizyon.com / admin123</p>
                  </div>
               </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-12 md:p-16">
               <Reveal>
                  <h1 className="h2-premium mb-2">Giriş Yap</h1>
                  <p className="text-clinical-muted text-sm mb-10">Lütfen hesap bilgilerinizi giriniz.</p>
               </Reveal>

               <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const user = login(form.email, form.password);
                  if (!user) {
                    setError("E-posta veya şifre hatalı.");
                    return;
                  }
                  if (user.role === "admin") router.push("/admin");
                  else router.push("/panelim");
                }}
                className="space-y-6"
              >
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
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-navy w-full py-4 text-base">
                  Giriş Yap
                  <ArrowRight className="h-5 w-5" />
                </button>

                <div className="pt-8 text-center text-sm text-clinical-muted">
                  Hesabınız yok mu?{" "}
                  <Link href="/kayit" className="font-bold text-navy-900 hover:text-accent-blue transition-colors">
                    Hemen Kayıt Olun
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
