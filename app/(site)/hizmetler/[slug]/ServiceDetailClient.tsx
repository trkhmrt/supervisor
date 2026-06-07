"use client";


import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
} from "lucide-react";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { BookingPanel } from "@/components/site/BookingPanel";
import { supervisorsListHref } from "@/lib/services/supervisor-filter";
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
  const supervisorsHref = supervisorsListHref(service);

  return (
    <>
      {/* HEADER SECTION */}
      <section className="bg-navy-950 text-white pt-site-hero pb-20 relative overflow-hidden">
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
                  <Link href={supervisorsHref} className="btn-white">
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
                <div className="card-premium">
                  <h3 className="h3-premium mb-6">Randevu Oluştur</h3>
                  <p className="text-clinical-muted text-sm mb-8">
                    {service.name} hizmeti veren süpervizörler arasından size en uygun uzmanı
                    seçerek randevunuzu hemen planlayabilirsiniz.
                  </p>
                  <Link href={supervisorsHref} className="btn-navy w-full">
                    Hemen Randevu Al
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
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
                  {featuredSupervisor.fullName} ile bireysel süpervizyon randevunuzu aşağıdan
                  oluşturabilirsiniz. Tüm süpervizörleri görmek için{" "}
                  <Link href={supervisorsHref} className="font-semibold text-navy-900 underline">
                    listeyi filtreleyin
                  </Link>
                  .
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
