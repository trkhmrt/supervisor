"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, MailCheck, AlertCircle, Loader2, Phone, Mail, User, Lock } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { authErrorMessage, signUpWithEmail } from "@/lib/auth/client";
import { redirectPathForRole } from "@/lib/auth/redirect";
import { USER_PROFESSIONS } from "@/lib/constants/user-professions";
import { isValidPhone, normalizePhone } from "@/lib/validation/phone";
import { useAppStore } from "@/lib/store";
import { SupervisorRequestBlock } from "@/components/site/SupervisorRequestBlock";

export default function RegisterPage() {
  const router = useRouter();
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profession: "",
    password: "",
    accept: false,
  });
  const [step, setStep] = useState<"form" | "verify" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (step === "done") {
    return (
        <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-site-hero">
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
              <button onClick={() => router.push("/dashboard")} className="btn-navy py-3 px-8">
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
        <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-site-hero">
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
      <section className="min-h-screen bg-clinical-light flex items-center justify-center pt-site-hero pb-24">
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
                    Süpervizyon alan olarak ücretsiz kayıt olun; süpervizörlerden randevu alın.
                    Süpervizör kaydı yalnızca davet linki ile açılır.
                  </p>
                  
               </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:col-span-7 p-12 md:p-16">
               <Reveal>
                  <h1 className="h2-premium mb-2">Kayıt Ol</h1>
                  <p className="text-clinical-muted text-sm mb-8">
                    Üye hesabı oluşturmak için aşağıdaki formu doldurun.
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
                  if (!form.firstName.trim() || !form.lastName.trim()) {
                    setError("Ad ve soyad zorunludur.");
                    return;
                  }
                  if (!isValidPhone(form.phone)) {
                    setError("Geçerli bir telefon numarası girin (en az 10 rakam).");
                    return;
                  }
                  if (!form.profession.trim()) {
                    setError("Mesleki rolünüzü seçin.");
                    return;
                  }
                  setLoading(true);
                  try {
                    const user = await signUpWithEmail({
                      firstName: form.firstName,
                      lastName: form.lastName,
                      email: form.email,
                      phone: normalizePhone(form.phone),
                      profession: form.profession,
                      password: form.password,
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
                    <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Ad</label>
                                        <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        placeholder="Ayşe"
                        className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Soyad</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                      <input
                        required
                        value={form.lastName}
                        onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                        placeholder="Yılmaz"
                        className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy-900">E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="ornek@email.com"
                        className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Telefon</label>
                                        <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                      <input
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="05XX XXX XX XX"
                        className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Mesleki rolünüz</label>
                  <select
                    required
                    value={form.profession}
                    onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
                    className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                  >
                    <option value="">Seçiniz</option>
                    {USER_PROFESSIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                    <input
                      required
                      type="password"
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="En az 6 karakter"
                      className="w-full bg-clinical-light border border-clinical-border rounded-premium pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                    />
                  </div>
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

                <SupervisorRequestBlock />

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
