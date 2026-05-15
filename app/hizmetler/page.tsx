"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ServiceIcon } from "@/components/site/ServiceIcon";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export default function HizmetlerPage() {
  const services = useAppStore((s) => s.services.filter((x) => x.active));

  return (
    <SiteShell>
      <section className="bg-navy-950 text-white pt-32 pb-20">
        <div className="container-wide">
          <Reveal>
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">Hizmet Modellerimiz</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 max-w-3xl leading-tight">
              Klinik Gelişiminiz İçin <br />
              <span className="text-navy-300">Yapılandırılmış Çözümler</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-navy-200 text-lg max-w-2xl leading-relaxed">
              Bireysel derinleşmeden grup paylaşımına kadar, her aşamada etik 
              standartları ve bilimsel temelli yaklaşımları merkeze alıyoruz.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <StaggerContainer className="grid lg:grid-cols-2 gap-8">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <div className="card-premium h-full flex flex-col md:flex-row gap-8 p-10 group">
                  <div className="w-16 h-16 bg-navy-50 rounded-premium flex items-center justify-center text-navy-900 shrink-0 group-hover:bg-navy-900 group-hover:text-white transition-colors duration-500">
                    <ServiceIcon icon={s.icon} className="h-8 w-8" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h2 className="h2-premium text-2xl mb-4">{s.name}</h2>
                    <p className="text-clinical-muted text-sm leading-relaxed mb-8">
                      {s.description}
                    </p>
                    
                    <ul className="space-y-3 mb-10">
                      {s.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm text-clinical-text">
                          <CheckCircle2 className="h-4 w-4 text-navy-400 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-clinical-border">
                      <div>
                         <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted mb-1">Seans Başına</div>
                         <div className="text-2xl font-bold text-navy-900">{formatPrice(s.price)}</div>
                      </div>
                      <Link href={`/hizmetler/${s.slug}`} className="btn-navy py-2 px-6">
                        Detaylar
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </SiteShell>
  );
}
