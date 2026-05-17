"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, MailCheck, AlertCircle, Loader2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { authErrorMessage, signUpWithEmail } from "@/lib/auth/client";
import { redirectPathForRole } from "@/lib/auth/redirect";
import { useAppStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    profession: "",
    experienceYears: 0,
    accept: false,
  });
  const [step, setStep] = useState<"form" | "verify" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (step === "done") {
    return (
        <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-20">
          <div className="container-narrow text-center py-24 bg-white rounded-premium shadow-2xl border border-clinical-border px-12">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="h2-premium mb-4">Kayıt Tamamlandı</h1>
            <p className="text-clinical-muted mb-10 max-w-sm mx-auto leading-relaxed">
              Hoş geldiniz. Artık süpervizörlerle randevu alabilir ve profilinizi 
              yönetebilirsiniz.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => router.push("/panelim")} className="btn-navy py-3 px-8">
                Panelime Git
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/supervizorler" className="btn-outline-navy py-3 px-8">
                Uzmanları İncele
              </Link>
            </div>
          </div>
        </section>
    );
  }

  if (step === "verify") {
    return (
        <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-20">
          <div className="container-narrow text-center py-24 bg-white rounded-premium shadow-2xl border border-clinical-border px-12">
            <div className="w-20 h-20 bg-navy-50 text-navy-900 rounded-full flex items-center justify-center mx-auto mb-8">
              <MailCheck className="h-10 w-10" />
            </div>
            <h1 className="h2-premium mb-4">E-postanızı Doğrulayın</h1>
            <p className="text-clinical-muted mb-10 max-w-sm mx-auto leading-relaxed">
              {form.email} adresine bir doğrulama bağlantısı gönderdik. Lütfen 
              gelen kutunuzu kontrol edin; ardından giriş yapabilirsiniz.
            </p>
            <Link href="/giris" className="btn-navy py-3 px-8 inline-flex">
              Giriş Sayfasına Git
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
    );
  }

  return (
      <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-32 pb-24">
        <div className="container-wide flex justify-center">
          <div className="w-full max-w-6xl grid lg:grid-cols-12 bg-white rounded-premium shadow-2xl overflow-hidden border border-clinical-border">
            {/* Left Side - Info */}
            <div className="lg:col-span-5 bg-navy-900 text-white p-12 md:p-16 flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
               <div className="relative z-10 flex-1">
                  <Link href="/" className="flex items-center gap-3 mb-16">
                    <div className="w-10 h-10 bg-white rounded-premium flex items-center justify-center text-navy-900">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-tight">Süpervizyon</span>
                  </Link>
                  <h2 className="text-4xl font-display font-bold mb-8 leading-tight">
                    Aramıza <br /> Katılın
                  </h2>
                  <p className="text-navy-300 leading-relaxed">
                    Ücretsiz hesap oluşturun; süpervizörlerden randevu alın,
                    randevularınızı panelinizden takip edin.
                  </p>
                  
               </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:col-span-7 p-12 md:p-16">
               <Reveal>
                  <h1 className="h2-premium mb-2">Kayıt Ol</h1>
                  <p className="text-clinical-muted text-sm mb-8">
                    Bireysel kullanıcı hesabı oluşturun — e-posta ile kayıt olun.
                  </p>
               </Reveal>

               <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError(null);
                  if (!form.accept) {
                    setError("Devam etmek için kullanım koşullarını kabul etmelisiniz.");
                    return;
                  }
                  setLoading(true);
                  try {
                    const user = await signUpWithEmail({
                      fullName: form.fullName,
                      email: form.email,
                      password: form.password,
                      profession: form.profession,
                      experienceYears: form.experienceYears,
                    });
                    if (user) {
                      setAuthUser(user);
                      router.push(redirectPathForRole(user.role));
                      return;
                    }
                    setStep("verify");
                  } catch (err) {
                    setError(authErrorMessage(err));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Ad Soyad</label>
                     <input
                       required
                       value={form.fullName}
                       onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                       placeholder="Ayşe Yılmaz"
                       className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-navy-900">E-posta</label>
                     <input
                       required
                       type="email"
                       value={form.email}
                       onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                       placeholder="ornek@email.com"
                       className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                     />
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Meslek / Uzmanlık</label>
                     <input
                       required
                       value={form.profession}
                       onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
                       placeholder="Örn. Psikoloji öğrencisi"
                       className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Deneyim (Yıl)</label>
                     <input
                       type="number"
                       min={0}
                       value={form.experienceYears}
                       onChange={(e) => setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))}
                       placeholder="0"
                       className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                     />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Şifre</label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="En az 6 karakter"
                    className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                  />
                </div>

                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    id="accept"
                    checked={form.accept}
                    onChange={(e) => setForm((f) => ({ ...f, accept: e.target.checked }))}
                    className="mt-1 w-4 h-4 rounded border-clinical-border text-navy-900 focus:ring-navy-900"
                  />
                  <label htmlFor="accept" className="text-xs text-clinical-muted leading-relaxed">
                    <Link href="/kosullar" className="font-bold text-navy-900 hover:underline">Kullanım koşullarını</Link> ve <Link href="/gizlilik" className="font-bold text-navy-900 hover:underline">gizlilik politikasını</Link> okudum, kabul ediyorum.
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-premium bg-[#f1f0f0] p-4 text-sm text-black">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-navy w-full py-4 text-base disabled:opacity-60">
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Kayıt yapılıyor…
                    </>
                  ) : (
                    <>
                      Kayıt Ol
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="pt-6 text-center text-sm text-clinical-muted">
                  Zaten hesabınız var mı?{" "}
                  <Link href="/giris" className="font-bold text-navy-900 hover:text-accent-blue transition-colors">
                    Giriş Yapın
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
  );
}
