"use client";


import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Star,
  Clock,
  ShieldCheck,
  Video,
  Award,
  Calendar,
} from "lucide-react";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { formatPrice } from "@/lib/utils";
import { BookingPanel } from "@/components/site/BookingPanel";
import type { Service, Supervisor } from "@/lib/types";
export function ServiceDetailClient({
  service,
  featuredSupervisor,
}: {
  service: Service;
  featuredSupervisor: Supervisor | null;
  services: Service[];
}) {
  const isIndividual =
    service.slug === "bireysel-supervizyon" || service.id === "individual";

  return (
    <>
      {/* HEADER SECTION */}
      <section className="bg-navy-950 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/4" />
        <div className="container-wide relative z-10">
          <Reveal>
            <Link href="/hizmetler" className="text-navy-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
              ← Tüm Hizmetler
            </Link>
          </Reveal>
          <div className="mt-8">
            <div className="max-w-3xl">
              <Reveal delay={0.1}>
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur border border-white/10 px-4 py-2 rounded-premium text-sm font-bold mb-6">
                  <ServiceIcon icon={service.icon} className="h-5 w-5 text-navy-300" />
                  {service.name}
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                  {service.name}
                </h1>
              </Reveal>
              <Reveal delay={0.3}>
                <p className="text-navy-200 text-lg leading-relaxed max-w-xl">
                  {service.description}
                </p>
              </Reveal>
              
              <Reveal delay={0.4}>
                <div className="mt-10 flex flex-wrap gap-8">
                   <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-navy-400" />
                      <span className="text-sm font-bold uppercase tracking-widest">{service.duration} Dakika</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-navy-400" />
                      <span className="text-sm font-bold uppercase tracking-widest">Online Seans</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-navy-400" />
                      <span className="text-sm font-bold uppercase tracking-widest">Etik Güvence</span>
                   </div>
                </div>
              </Reveal>

              <Reveal delay={0.5}>
                <div className="mt-10">
                  <Link href={isIndividual ? "#takvim" : "/supervizorler"} className="btn-white">
                    Hemen Randevu Al
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <Reveal>
                <h2 className="h2-premium mb-8">Hizmet Kapsamı ve Odak Noktalarımız</h2>
              </Reveal>
              
              <StaggerContainer className="grid sm:grid-cols-2 gap-4">
                {service.features.map((f) => (
                  <StaggerItem key={f}>
                    <div className="card-premium card-flat-hover p-6 flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-navy-900 mt-1 shrink-0" />
                      <span className="text-clinical-text font-medium">{f}</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <Reveal delay={0.4} className="mt-16">
                <div className="bg-clinical-light p-10 rounded-premium border border-clinical-border">
                   <h3 className="h3-premium mb-4">Süreç Nasıl İlerliyor?</h3>
                   <div className="space-y-6">
                      <Step number="01" title="Uzman Seçimi" desc="Kendi alanınıza ve yaklaşımınıza en uygun süpervizörü seçin." />
                      <Step number="02" title="Randevu Planlama" desc="Müsaitlik takviminden size uygun saati rezerve edin." />
                      <Step number="03" title="Online Seans" desc="Onaylanan randevunuz için Meet linki otomatik olarak iletilir." />
                   </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <div id="randevu" className="sticky top-32">
                {isIndividual && featuredSupervisor ? (
                  <FeaturedSupervisorCard supervisor={featuredSupervisor} serviceDuration={service.duration} />
                ) : (
                  <div className="card-premium">
                    <h3 className="h3-premium mb-6">Randevu Oluştur</h3>
                    <p className="text-clinical-muted text-sm mb-8">
                      Süpervizör listemizden size en uygun uzmanı seçerek randevunuzu 
                      hemen planlayabilirsiniz.
                    </p>
                    <Link href="/supervizorler" className="btn-navy w-full">
                      Süpervizörleri Listele
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING PANEL SECTION */}
      {isIndividual && featuredSupervisor && (
        <section id="takvim" className="py-24 bg-clinical-light border-t border-clinical-border">
          <div className="container-wide">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Reveal>
                <span className="eyebrow-premium">Online Rezervasyon</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="h2-premium">Müsaitlik Takvimi</h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-4 text-clinical-muted">
                  {featuredSupervisor.fullName} ile bireysel süpervizyon randevunuzu 
                  aşağıdan oluşturabilirsiniz.
                </p>
              </Reveal>
            </div>
            
            <Reveal delay={0.3}>
              <div className="max-w-4xl mx-auto">
                <BookingPanel
                  supervisorId={featuredSupervisor.id}
                  serviceType={service.id}
                  supervisor={featuredSupervisor}
                  service={service}
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6">
      <div className="text-2xl font-display font-bold text-navy-200">{number}</div>
      <div>
        <h4 className="font-bold text-navy-900 mb-1">{title}</h4>
        <p className="text-sm text-clinical-muted">{desc}</p>
      </div>
    </div>
  );
}

function FeaturedSupervisorCard({
  supervisor,
  serviceDuration,
}: {
  supervisor: Supervisor;
  serviceDuration: number;
}) {
  return (
    <div className="card-premium card-flat-hover p-0 overflow-hidden shadow-2xl">
      <div className="relative h-44 sm:h-auto sm:aspect-square">
        <Image src={supervisor.photo} alt={supervisor.fullName} fill className="object-cover" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-navy-900 flex items-center gap-1">
          <Star className="h-3 w-3 text-accent-gold fill-accent-gold" />
          {supervisor.rating}
        </div>
      </div>
      <div className="p-5 sm:p-8">
        <div className="text-xs font-bold text-accent-gold uppercase tracking-widest mb-2">{supervisor.title}</div>
        <h3 className="h3-premium mb-4 sm:mb-6">{supervisor.fullName}</h3>

        <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
          <div className="flex justify-between border-b border-clinical-border pb-3 text-sm sm:pb-4">
            <span className="text-clinical-muted">Seans Ücreti</span>
            <span className="font-bold text-navy-900">{formatPrice(supervisor.pricePerSession)}</span>
          </div>
          <div className="flex justify-between border-b border-clinical-border pb-3 text-sm sm:pb-4">
            <span className="text-clinical-muted">Seans Süresi</span>
            <span className="font-bold text-navy-900">{serviceDuration} Dakika</span>
          </div>
        </div>

        <Link href={`/supervizorler/${supervisor.id}`} className="btn-navy w-full">
          Profili İncele
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
