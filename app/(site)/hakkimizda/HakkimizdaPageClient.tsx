"use client";


import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, ShieldCheck, Compass, Users, Award, CheckCircle2 } from "lucide-react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import type { Supervisor } from "@/lib/types";
export function HakkimizdaPageClient({ supervisors }: { supervisors: Supervisor[] }) {
  return (
    <>
      <section className="bg-navy-950 text-white pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/4" />
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Reveal>
                <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">Kurumsal Vizyonumuz</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                  Klinik Mükemmelliği <br />
                  <span className="text-navy-300">Birlikte İnşa Ediyoruz</span>
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-navy-200 text-lg leading-relaxed max-w-xl">
                  Süpervizyon, terapistin mesleki gelişiminin omurgasıdır. Biz; 
                  etik, bilimsel ve kurumsal standartlarda bir gelişim ekosistemi 
                  yaratmak için buradayız.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/supervizorler" className="btn-white">
                    Uzman Kadromuz
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/iletisim" className="btn-outline-navy border-white text-white hover:bg-white/10">
                    Bize Ulaşın
                  </Link>
                </div>
              </Reveal>
            </div>
            
            <div className="relative">
               <Reveal delay={0.2} scale={0.95}>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-4">
                        <div className="relative aspect-[3/4] rounded-premium overflow-hidden shadow-2xl">
                           <Image src={supervisors[0]?.photo} alt="" fill className="object-cover" />
                        </div>
                        <div className="bg-white/10 backdrop-blur p-6 rounded-premium border border-white/10">
                           <div className="text-2xl font-bold">10+</div>
                           <div className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Yıllık Tecrübe</div>
                        </div>
                     </div>
                     <div className="space-y-4 pt-12">
                        <div className="bg-accent-gold/20 backdrop-blur p-6 rounded-premium border border-accent-gold/20">
                           <ShieldCheck className="h-8 w-8 text-accent-gold mb-4" />
                           <div className="text-sm font-bold">Etik Standartlar</div>
                        </div>
                        <div className="relative aspect-[3/4] rounded-premium overflow-hidden shadow-2xl">
                           <Image src={supervisors[1]?.photo} alt="" fill className="object-cover" />
                        </div>
                     </div>
                  </div>
               </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal>
              <span className="eyebrow-premium">Değerlerimiz</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2-premium">Platformumuzu Şekillendiren İlkeler</h2>
            </Reveal>
          </div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="card-premium h-full text-center">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 mx-auto mb-8">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="h3-premium mb-4">Etik Bütünlük</h3>
                <p className="text-clinical-muted text-sm leading-relaxed">
                  Tüm süreçlerimizde uluslararası etik kuralları ve danışan gizliliğini 
                  en üst seviyede koruyoruz.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="card-premium h-full text-center">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 mx-auto mb-8">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="h3-premium mb-4">Bilimsel Temel</h3>
                <p className="text-clinical-muted text-sm leading-relaxed">
                  Kanıta dayalı terapi yaklaşımlarını ve güncel klinik literatürü 
                  süpervizyon süreçlerimizin merkezine alıyoruz.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="card-premium h-full text-center">
                <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 mx-auto mb-8">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="h3-premium mb-4">Sürekli Gelişim</h3>
                <p className="text-clinical-muted text-sm leading-relaxed">
                  Mesleki yolculuğun her aşamasında öğrenmeyi ve deneyim paylaşımını 
                  destekleyen bir topluluk olmayı hedefliyoruz.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <section className="py-24 bg-clinical-light border-y border-clinical-border">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <Reveal>
                <span className="eyebrow-premium">Misyonumuz</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="h2-premium mb-8">Neden Buradayız?</h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-clinical-text text-lg leading-relaxed mb-10">
                  Türkiye&apos;deki ruh sağlığı profesyonellerinin kaliteli süpervizyona 
                  erişimini kolaylaştırmak, dijitalleşen dünyada güvenli ve kurumsal 
                  bir platform sunmak için yola çıktık.
                </p>
              </Reveal>
              
              <div className="space-y-4">
                 <MissionPoint text="Erişilebilir ve esnek süpervizyon modelleri." />
                 <MissionPoint text="Davet usulü seçilmiş, doğrulanmış uzman kadrosu." />
                 <MissionPoint text="Uçtan uca şeffaf ve güvenli dijital deneyim." />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <StatBox label="Tamamlanan Seans" value="5000+" />
               <StatBox label="Aktif Süpervizör" value="40+" />
               <StatBox label="Kullanıcı Memnuniyeti" value="%98" />
               <StatBox label="Klinik Yaklaşım" value="12+" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MissionPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-navy-900" />
      <span className="font-bold text-navy-900 text-sm uppercase tracking-wide">{text}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-8 rounded-premium border border-clinical-border text-center shadow-sm">
      <div className="text-3xl font-display font-bold text-navy-900 mb-2">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">{label}</div>
    </div>
  );
}
