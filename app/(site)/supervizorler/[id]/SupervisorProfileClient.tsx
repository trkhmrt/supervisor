"use client";


import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Award,
  Globe,
  BookOpen,
  Quote,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { useAppStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Service, Supervisor } from "@/lib/types";
export function SupervisorProfileClient({
  supervisor,
  bookingService,
}: {
  supervisor: Supervisor;
  services: Service[];
  bookingService: Service | null;
  featuredSupervisors?: Supervisor[];
}) {
  const reviews = useAppStore((s) => s.reviews.filter((r) => r.supervisorId === supervisor.id));

  return (
    <>
      <section className="bg-navy-950 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4">
              <Reveal y={30}>
                <div className="relative aspect-[4/5] rounded-premium overflow-hidden shadow-2xl border border-white/10">
                  <Image src={supervisor.photo} alt={supervisor.fullName} fill className="object-cover" priority />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-navy-900 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-accent-blue" />
                    Doğrulanmış
                  </div>
                </div>
              </Reveal>
            </div>
            
            <div className="lg:col-span-8">
              <Reveal delay={0.1}>
                <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">{supervisor.title}</span>
              </Reveal>
              <Reveal delay={0.2}>
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
                  {supervisor.fullName}
                </h1>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-wrap gap-6 mb-8">
                   <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-accent-gold fill-accent-gold" />
                      <span className="font-bold text-lg">{supervisor.rating}</span>
                      <span className="text-navy-400 text-sm">({supervisor.reviewCount} Değerlendirme)</span>
                   </div>
                   <div className="w-px h-6 bg-white/10 hidden sm:block" />
                   <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-navy-400" />
                      <span className="font-bold">{supervisor.yearsExperience}+ Yıl Klinik Tecrübe</span>
                   </div>
                </div>
              </Reveal>
              
              <Reveal delay={0.4}>
                <div className="grid sm:grid-cols-3 gap-4">
                   <DetailBox icon={BookOpen} label="Lisans" value={supervisor.license} />
                   <DetailBox icon={Globe} label="Diller" value={supervisor.languages.join(", ")} />
                   <DetailBox icon={MapPin} label="Konum" value="Online / Global" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
               <Reveal>
                 <h2 className="h2-premium mb-8">Klinik Yaklaşım ve Biyografi</h2>
               </Reveal>
               <Reveal delay={0.1}>
                 <p className="text-clinical-text text-lg leading-relaxed mb-12">
                   {supervisor.bio}
                 </p>
               </Reveal>
               
               <div className="grid sm:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-navy-500 mb-6">Uzmanlık Alanları</h4>
                    <div className="flex flex-wrap gap-2">
                      {supervisor.expertise.map(e => (
                        <span key={e} className="bg-navy-50 text-navy-900 px-3 py-1.5 rounded-premium text-sm font-medium border border-navy-100">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-navy-500 mb-6">Terapi Yaklaşımları</h4>
                    <div className="flex flex-wrap gap-2">
                      {supervisor.approaches.map(a => (
                        <span key={a} className="bg-white text-navy-900 px-3 py-1.5 rounded-premium text-sm font-medium border border-clinical-border">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-5">
               <div className="card-premium sticky top-32">
                  <h3 className="h3-premium mb-6">Seans Bilgileri</h3>
                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between items-center py-4 border-b border-clinical-border">
                        <span className="text-clinical-muted text-sm">Bireysel Seans Ücreti</span>
                        <span className="text-2xl font-bold text-navy-900">{formatPrice(supervisor.pricePerSession)}</span>
                     </div>
                     <div className="flex justify-between items-center py-4 border-b border-clinical-border">
                        <span className="text-clinical-muted text-sm">Seans Süresi</span>
                        <span className="font-bold text-navy-900">50 Dakika</span>
                     </div>
                     <div className="flex justify-between items-center py-4">
                        <span className="text-clinical-muted text-sm">Platform</span>
                        <span className="font-bold text-navy-900 flex items-center gap-2">
                           <Video className="h-4 w-4 text-accent-blue" />
                           Google Meet
                        </span>
                     </div>
                  </div>
                  <Link href={`/supervizorler/${supervisor.id}/randevu`} className="btn-navy w-full">
                     Hemen Randevu Al
                     <Calendar className="h-4 w-4" />
                  </Link>
                  <p className="text-[10px] text-center text-clinical-muted mt-4 uppercase tracking-widest">
                     256-bit SSL Güvenli Ödeme Altyapısı
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-clinical-light border-y border-clinical-border">
        <div className="container-wide">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center card-premium p-12">
              <span className="info-highlight text-xs uppercase tracking-widest">Online Randevu</span>
              <h2 className="h2-premium mt-4 mb-4">Takvimden gün ve saat seçin</h2>
              <p className="text-clinical-muted mb-8 leading-relaxed">
                {supervisor.fullName} ile seans planlamak için müsaitlik takvimine gidin.
                Google Meet bağlantısı e-posta adresinize iletilir.
              </p>
              <Link href={`/supervizorler/${supervisor.id}/randevu`} className="btn-navy inline-flex">
                Randevu Oluştur
                <Calendar className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container-wide">
            <div className="flex justify-between items-end mb-16">
               <div>
                  <Reveal>
                    <span className="eyebrow-premium">Geri Bildirimler</span>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <h2 className="h2-premium">Kullanıcı Deneyimleri</h2>
                  </Reveal>
               </div>
            </div>

            <StaggerContainer className="grid md:grid-cols-2 gap-8">
              {reviews.map((r) => (
                <StaggerItem key={r.id}>
                  <div className="card-premium">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-accent-gold fill-accent-gold" : "text-clinical-border"}`} />
                      ))}
                    </div>
                    <p className="text-clinical-text italic mb-8 leading-relaxed">
                      &quot;{r.comment}&quot;
                    </p>
                    <div className="flex justify-between items-center pt-6 border-t border-clinical-border">
                       <span className="font-bold text-navy-900 text-sm">{r.authorName}</span>
                       <span className="text-clinical-muted text-xs">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}
    </>
  );
}
function DetailBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 p-5 rounded-premium">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-4 w-4 text-navy-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400">{label}</span>
      </div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}
