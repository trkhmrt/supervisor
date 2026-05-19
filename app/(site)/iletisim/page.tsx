"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Check, Send, AlertCircle, ShieldCheck } from "lucide-react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { useAppStore } from "@/lib/store";

export default function IletisimPage() {
  const settings = useAppStore((s) => s.settings);
  const addContactMessage = useAppStore((s) => s.addContactMessage);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <section className="bg-navy-950 text-white pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
        <div className="container-wide relative z-10">
          <Reveal>
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">Bize Ulaşın</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 max-w-3xl leading-tight">
              Sorularınız İçin <br />
              <span className="text-navy-300">Yanınızdayız</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-navy-200 text-lg max-w-2xl leading-relaxed">
              Klinik süreçler, kurumsal üyelikler veya teknik destek konularında 
              uzman ekibimizle iletişime geçebilirsiniz.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 space-y-12">
               <StaggerContainer className="space-y-8">
                  <StaggerItem>
                     <ContactBox icon={Mail} label="E-posta" value={settings.email} href={`mailto:${settings.email}`} />
                  </StaggerItem>
                  <StaggerItem>
                     <ContactBox icon={Phone} label="Telefon" value={settings.phone} href={`tel:${settings.phone}`} />
                  </StaggerItem>
                  <StaggerItem>
                     <ContactBox icon={MapPin} label="Merkez Ofis" value={settings.address} />
                  </StaggerItem>
               </StaggerContainer>

               <Reveal delay={0.4}>
                  <div className="bg-clinical-light p-8 rounded-premium border border-clinical-border">
                     <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="h-6 w-6 text-navy-900" />
                        <h4 className="font-bold text-navy-900">Süpervizör Başvurusu</h4>
                     </div>
                     <p className="text-clinical-muted text-sm leading-relaxed mb-6">
                        Uzman kadromuza katılmak için özgeçmişinizi ve klinik tecrübenizi 
                        detaylandıran bir mesajla bize ulaşabilirsiniz.
                     </p>
                     <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">
                        Sadece davet usulü kayıt kabul edilmektedir.
                     </div>
                  </div>
               </Reveal>
            </div>

            <div className="lg:col-span-8">
               <div className="card-premium p-12">
                  {sent ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Check className="h-10 w-10" />
                      </div>
                      <h3 className="h2-premium mb-4">Mesajınız Alındı</h3>
                      <p className="text-clinical-muted mb-10 max-w-sm mx-auto">
                        İlettiğiniz bilgiler uzman ekibimize ulaştı. En kısa sürede 
                        tarafınıza dönüş sağlanacaktır.
                      </p>
                      <button onClick={() => setSent(false)} className="btn-navy">Yeni Mesaj Gönder</button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setError(null);
                        if (!form.name || !form.email || !form.message) {
                          setError("Lütfen zorunlu alanları doldurun.");
                          return;
                        }
                        void fetch("/api/contact", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(form),
                        }).then((res) => {
                          if (res.ok) setSent(true);
                          else setError("Mesaj gönderilemedi.");
                        });
                      }}
                      className="space-y-8"
                    >
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Ad Soyad</label>
                          <input
                            required
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                            placeholder="Örn: Dr. Ahmet Yılmaz"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-navy-900">E-posta</label>
                          <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                            placeholder="ahmet@klinik.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Konu</label>
                        <input
                          value={form.subject}
                          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                          className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                          placeholder="Mesajınızın konusu"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Mesajınız</label>
                        <textarea
                          required
                          rows={6}
                          value={form.message}
                          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                          className="w-full bg-clinical-light border border-clinical-border rounded-premium px-5 py-4 text-sm focus:outline-none focus:border-navy-900 transition-colors resize-none"
                          placeholder="Size nasıl yardımcı olabiliriz?"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-3 rounded-premium bg-[#f1f0f0] p-4 text-sm text-black">
                          <AlertCircle className="h-5 w-5" />
                          {error}
                        </div>
                      )}

                      <button type="submit" className="btn-navy w-full py-4 text-base">
                        Mesajı Gönder
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  )}
               </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactBox({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
   const content = (
      <div className="flex items-center gap-6 group">
         <div className="w-12 h-12 bg-navy-50 rounded-premium flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-all duration-300">
            <Icon className="h-6 w-6" />
         </div>
         <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted mb-1">{label}</div>
            <div className="font-bold text-navy-900 group-hover:text-accent-blue transition-colors">{value}</div>
         </div>
      </div>
   );
   return href ? <a href={href}>{content}</a> : content;
}
