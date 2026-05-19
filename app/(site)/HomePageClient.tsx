"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Clock,
  Quote,
  HeartPulse,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { BlogPost, Service, Supervisor } from "@/lib/types";

export function HomePageClient({
  services,
  supervisors,
}: {
  services: Service[];
  supervisors: Supervisor[];
}) {
  const featuredSupervisors = supervisors.slice(0, 3);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const heroWords = ["Güvenle", "Derinlikle", "Etikle"];
  const floatingKeywords = ["Vaka Analizi", "Etik Çerçeve", "Canlı Geri Bildirim", "Sürekli Gelişim"];
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [heroWords.length]);

  useEffect(() => {
    void fetch("/api/blog")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: BlogPost[]) => setPosts(data.slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-gradient-bg relative flex min-h-[90vh] items-center overflow-hidden pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 animated-grid-bg opacity-40" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-black/10 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-0 top-10 h-80 w-80 rounded-full bg-[#d1f90b]/30 blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 left-1/3 h-60 w-60 rounded-full bg-[#d1f90b]/25 blur-3xl"
            animate={{ x: [0, 35, 0], y: [0, 25, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="container-wide">
          <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="info-highlight">Klinik Odakli Supervizyon</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="h1-premium text-balance mx-auto mt-6 max-w-4xl lg:mx-0">
                  Tedavi Yetkinliginizi
                  <span className="mx-2 inline-flex min-h-[1.3em] items-center text-black">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={heroWords[activeWordIndex]}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        transition={{ duration: 0.35 }}
                        className="inline-block"
                      >
                        {heroWords[activeWordIndex]}
                      </motion.span>
                    </AnimatePresence>
                    <span className="ml-2">Geliştirin</span>
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-clinical-muted lg:mx-0">
                  Klinik ortamda aktif çalışan psikolog ve süpervizörler için tasarlanmış,
                  tedavi odaklı bir gelişim alanı. Vaka paylaşımı, etik çerçeve ve takipli
                  geri bildirimle supervizyon surecinizi guvenle yonetin.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Link href="/supervizorler" className="btn-navy">
                    Hemen Randevu Al
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/hizmetler" className="btn-outline-navy">
                    Klinik Hizmetler
                  </Link>
                </div>
              </Reveal>
              
              <Reveal delay={0.4}>
                <div className="mx-auto mt-16 flex max-w-2xl items-center justify-center gap-8 border-t border-black/20 pt-8 lg:mx-0 lg:justify-start">
                  <div>
                    <div className="text-2xl font-bold text-black">40+</div>
                    <div className="text-xs uppercase tracking-wider text-clinical-muted">Klinik Uzman</div>
                  </div>
                  <div className="h-8 w-px bg-black/20" />
                  <div>
                    <div className="text-2xl font-bold text-black">5000+</div>
                    <div className="text-xs uppercase tracking-wider text-clinical-muted">Tedavi Seansi</div>
                  </div>
                  <div className="h-8 w-px bg-black/20" />
                  <div>
                    <div className="text-2xl font-bold text-black">4.9/5</div>
                    <div className="text-xs uppercase tracking-wider text-clinical-muted">Memnuniyet</div>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.25} x={20} className="relative">
              <div className="relative mx-auto w-full max-w-[460px]">
                <div className="relative overflow-hidden rounded-[28px] border border-black/15 bg-white/60 p-3 shadow-2xl backdrop-blur-xl">
                  <div className="absolute left-6 top-6 z-20 rounded-full bg-[#d1f90b] px-3 py-1 text-xs font-bold text-black">
                    Supervizyon Deneyimi
                  </div>
                  <div className="relative h-[500px] w-full overflow-hidden rounded-[22px]">
                    <Image
                      src={supervisors[0]?.photo || "/images/abdullatif.png"}
                      alt={supervisors[0]?.fullName || "Supervizor"}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  </div>
                </div>

                {floatingKeywords.map((keyword, index) => {
                  const placements = [
                    "left-[-18px] top-[72px]",
                    "right-[-20px] top-[150px]",
                    "left-[22px] bottom-[105px]",
                    "right-[16px] bottom-[36px]",
                  ];

                  return (
                    <motion.div
                      key={keyword}
                      className={`absolute ${placements[index]} rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-black shadow-lg`}
                      animate={{ y: [0, -10, 0], rotate: [0, -1.5, 0] }}
                      transition={{
                        duration: 4 + index,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3,
                      }}
                    >
                      {keyword}
                    </motion.div>
                  );
                })}
              </div>
            </Reveal>
          </div>

          </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 border-y border-clinical-border bg-clinical-light">
        <div className="container-wide">
          <div className="flex flex-wrap justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <TrustItem icon={ShieldCheck} label="Etik Onayli" />
            <TrustItem icon={HeartPulse} label="Tedavi Odakli Surec" />
            <TrustItem icon={Award} label="Klinik Yetkin Uzmanlar" />
            <TrustItem icon={Users} label="Süpervizyon Dayanismasi" />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-24 bg-clinical-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal>
              <span className="eyebrow-premium">Hizmet Modellerimiz</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2-premium">İhtiyacınıza Özel Klinik Çözümler</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 text-clinical-muted">
                Bireysel gelişimden grup dinamiklerine kadar, kariyerinizin her aşamasında 
                size destek olacak yapılandırılmış süpervizyon modelleri.
              </p>
            </Reveal>
          </div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <Link href={`/hizmetler/${s.slug}`} className="group card-clickable block h-full">
                  <div className="card-premium card-no-glare card-flat-hover h-full flex flex-col">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-premium bg-navy-50 text-navy-900 transition-colors duration-300 group-hover:bg-navy-700 group-hover:text-clinical-white">
                      <ServiceIcon icon={s.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="service-title-highlight h3-premium mb-3 inline-block">{s.name}</h3>
                    <p className="text-sm text-clinical-muted mb-6 flex-1">
                      {s.shortDescription}
                    </p>
                    <div className="flex items-center justify-end pt-6 border-t border-clinical-border mt-auto">
                      <ArrowUpRight className="h-4 w-4 text-navy-400 group-hover:text-navy-900 transition-colors" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* WHY US - INTERACTIVE SECTION */}
      <section className="py-24 bg-clinical-light text-navy-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           {/* Subtle grid pattern could go here */}
        </div>
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Reveal>
                <span className="info-highlight text-xs uppercase tracking-widest">Neden Biz?</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                  Klinik Mükemmellik <br />
                  <span className="inline-block rounded-md bg-[#d1f90b] px-3 py-1 text-black">Soft Health Deneyimiyle</span>
                </h2>
              </Reveal>
              
              <div className="space-y-8 mt-12">
                <WhyItem 
                  title="Doğrulanmış Uzman Kadrosu" 
                  desc="Tum supervizorlerimiz aktif klinik vakalarla calisan, en az 10 yil tecrubeli uzmanlardan secilir."
                />
                <WhyItem 
                  title="Kolay Randevu Akisi" 
                  desc="Takvim secimi, saat secimi ve onay tek panelde. Hatirlaticilar otomatik olarak olusturulur."
                />
                <WhyItem 
                  title="Sürdürülebilir Klinik Takip" 
                  desc="Seans sonu geri bildirimleriniz kaybolmaz; bir sonraki surece dogrudan aktarilir."
                />
              </div>
            </div>
            
            <div className="relative lg:h-[600px]">
               <Reveal delay={0.3} x={30}>
                 <div className="bg-clinical-white backdrop-blur-xl border border-clinical-border p-10 rounded-premium h-full flex flex-col justify-center shadow-premium">
                    <div className="space-y-12">
                       <div className="flex gap-6">
                          <div className="text-5xl font-display font-bold text-black">01</div>
                          <div>
                             <h4 className="text-xl font-bold mb-2">Hızlı Rezervasyon</h4>
                             <p className="text-clinical-muted text-sm leading-relaxed">Saniyeler icinde takvimi goruntuleyin ve randevunuzu kesinlestirin.</p>
                          </div>
                       </div>
                       <div className="flex gap-6">
                          <div className="text-5xl font-display font-bold text-black">02</div>
                          <div>
                             <h4 className="text-xl font-bold mb-2">Tedavi Odağına Uygun Eşleşme</h4>
                             <p className="text-clinical-muted text-sm leading-relaxed">Vaka tipinize uygun uzmanlik alanlarini one cikarir ve secimi hizlandirir.</p>
                          </div>
                       </div>
                       <div className="flex gap-6">
                          <div className="text-5xl font-display font-bold text-black">03</div>
                          <div>
                             <h4 className="text-xl font-bold mb-2">Takipli Seans Deneyimi</h4>
                             <p className="text-clinical-muted text-sm leading-relaxed">Onaylanan randevularinizin tum detaylari panelinizde anlik gorunur.</p>
                          </div>
                       </div>
                    </div>
                 </div>
               </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* SUPERVISORS PREVIEW */}
      <section className="py-24 bg-clinical-light">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <Reveal>
                <span className="eyebrow-premium">Uzman Kadromuz</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="h2-premium">Alanında Öncü Süpervizörler</h2>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <Link href="/supervizorler" className="btn-outline-navy">
                Tümünü Görüntüle
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {featuredSupervisors.map((sup) => (
              <StaggerItem key={sup.id}>
                <Link
                  href={`/supervizorler/${sup.id}`}
                  className="card-premium p-0 overflow-hidden group block cursor-pointer transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image 
                      src={sup.photo} 
                      alt={sup.fullName} 
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-5 lg:p-8">
                    <div className="mb-1 sm:mb-2 inline-block rounded-md bg-[#d1f90b] px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black line-clamp-1">{sup.title}</div>
                    <h3 className="text-sm sm:text-xl font-display font-bold text-navy-900 mb-2 sm:mb-4 line-clamp-2 leading-snug">{sup.fullName}</h3>
                    <div className="hidden sm:flex flex-wrap gap-2 mb-4 sm:mb-6">
                      {sup.expertise.slice(0, 2).map(e => (
                        <span key={e} className="text-[10px] bg-navy-50 text-navy-700 px-2 py-1 rounded uppercase font-bold tracking-wider">
                          {e}
                        </span>
                      ))}
                    </div>
                    <span className="flex items-center justify-between text-[11px] sm:text-sm font-bold text-navy-900 group-hover:text-black transition-colors">
                       Profili İncele
                       <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container-wide">
            <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
              <div className="max-w-2xl">
                <Reveal>
                  <span className="eyebrow-premium">Blog</span>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2 className="h2-premium">Klinik İçgörüler</h2>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <Link href="/blog" className="btn-outline-navy">
                  Tüm Yazılar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
            <StaggerContainer className="grid gap-10 md:grid-cols-3">
              {posts.map((p) => (
                <StaggerItem key={p.id}>
                  <Link href={`/blog/${p.slug}`} className="group block h-full">
                    <div className="card-premium flex h-full flex-col overflow-hidden p-0">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={p.cover}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-8">
                      <div className="mb-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatDate(p.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {p.readingTime} DK
                        </span>
                      </div>
                      <h3 className="h3-premium mb-4 group-hover:text-accent-blue transition-colors">{p.title}</h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-clinical-muted">{p.excerpt}</p>
                    </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="py-24 bg-clinical-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
               <Reveal>
                 <span className="eyebrow-premium">Görüşler</span>
               </Reveal>
               <Reveal delay={0.1}>
                 <h2 className="h2-premium mb-6">Meslektaşlarınız Ne Diyor?</h2>
               </Reveal>
               <Reveal delay={0.2}>
                 <p className="text-clinical-muted">
                   Platformumuz üzerinden süpervizyon alan yüzlerce terapistin 
                   deneyimlerini keşfedin.
                 </p>
               </Reveal>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
               <TestimonialCard 
                 quote="Süpervizyon sürecim hayatımda en çok dönüştürücü etkisi olan deneyimlerden biri. Tek bir platformda her şeyin olması işimi de çok kolaylaştırdı."
                 author="Zeynep Akın"
                 role="Klinik Psikolog"
               />
               <TestimonialCard 
                 quote="Eğitimli simülasyon danışanlarıyla yaptığım pratikler kendime güvenimi tamamen değiştirdi. Beceri kazanmak için en güzel format."
                 author="Mert Doğan"
                 role="PDR Uzmanı"
               />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="container-wide">
          <div className="bg-navy-gradient rounded-premium p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                {/* Abstract pattern */}
             </div>
             <Reveal className="relative z-10">
               <h2 className="text-3xl md:text-5xl font-display font-bold text-clinical-white mb-8">
                 Mesleki Gelişiminizde <br /> Yeni Bir Sayfa Açın
               </h2>
             </Reveal>
             <Reveal delay={0.1} className="relative z-10">
               <p className="text-navy-100 text-lg mb-10 max-w-2xl mx-auto">
                 Hemen ücretsiz kaydolun, uzman süpervizörlerimizle randevunuzu 
                 planlayın ve klinik yetkinliğinizi bir üst seviyeye taşıyın.
               </p>
             </Reveal>
             <Reveal delay={0.2} className="relative z-10 flex flex-wrap justify-center gap-4">
               <Link href="/kayit" className="btn-white">
                 Ücretsiz Kayıt Ol
                 <ArrowRight className="h-4 w-4" />
               </Link>
               <Link href="/iletisim" className="btn-outline-navy border-clinical-white text-clinical-white hover:bg-clinical-white/10">
                 Bize Ulaşın
               </Link>
             </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-navy-900" />
      <span className="text-sm font-bold text-navy-900 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function WhyItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-6">
      <div className="mt-1">
        <CheckCircle2 className="h-6 w-6 text-black" />
      </div>
      <div>
        <h4 className="text-lg font-bold mb-2">{title}</h4>
        <p className="text-clinical-muted text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="card-premium">
      <Quote className="h-8 w-8 text-navy-100 mb-6" />
      <p className="text-clinical-text italic mb-8 leading-relaxed">
        &quot;{quote}&quot;
      </p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center text-navy-900 font-bold">
          {author[0]}
        </div>
        <div>
          <div className="font-bold text-navy-900 text-sm">{author}</div>
          <div className="text-xs text-clinical-muted">{role}</div>
        </div>
      </div>
    </div>
  );
}
