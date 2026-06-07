"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { DbEmptyNotice } from "@/components/site/DbEmptyNotice";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import {
  EXPERTISE_AREAS,
  THERAPY_APPROACHES,
} from "@/lib/constants/supervisor-options";
import type { Service, Supervisor } from "@/lib/types";
import {
  resolveServiceFilterId,
  serviceFilterParamValue,
  supervisorProfileHref,
} from "@/lib/services/supervisor-filter";

const ALL = "all";

export function SupervisorsPageClient({
  supervisors,
  services,
  fetchError,
}: {
  supervisors: Supervisor[];
  services: Service[];
  fetchError: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialHizmet = searchParams.get("hizmet");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [expertise, setExpertise] = useState<string>(searchParams.get("alan") ?? ALL);
  const [serviceId, setServiceId] = useState<string>(() => {
    const resolved = resolveServiceFilterId(initialHizmet, services);
    return resolved ?? ALL;
  });
  const [approach, setApproach] = useState<string>(searchParams.get("yaklasim") ?? ALL);

  const syncUrl = useCallback(
    (next: { q?: string; alan?: string; hizmet?: string; yaklasim?: string }) => {
      const params = new URLSearchParams();
      const q = next.q ?? query;
      const a = next.alan ?? expertise;
      const h = next.hizmet ?? serviceId;
      const y = next.yaklasim ?? approach;
      if (q) params.set("q", q);
      if (a && a !== ALL) params.set("alan", a);
      if (h && h !== ALL) params.set("hizmet", serviceFilterParamValue(h, services));
      if (y && y !== ALL) params.set("yaklasim", y);
      const qs = params.toString();
      router.replace(qs ? `/supervizorler?${qs}` : "/supervizorler", { scroll: false });
    },
    [approach, expertise, query, router, serviceId, services]
  );

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setExpertise(searchParams.get("alan") ?? ALL);
    const resolved = resolveServiceFilterId(searchParams.get("hizmet"), services);
    setServiceId(resolved ?? ALL);
    setApproach(searchParams.get("yaklasim") ?? ALL);
  }, [searchParams, services]);

  const expertiseOptions = useMemo(() => {
    const used = new Set<string>();
    supervisors.forEach((s) => s.expertise.forEach((e) => used.add(e)));
    return EXPERTISE_AREAS.filter((e) => used.has(e));
  }, [supervisors]);

  const approachOptions = useMemo(() => {
    const used = new Set<string>();
    supervisors.forEach((s) => s.approaches.forEach((a) => used.add(a)));
    return THERAPY_APPROACHES.filter((a) => used.has(a));
  }, [supervisors]);

  const serviceOptions = useMemo(() => {
    const used = new Set<string>();
    supervisors.forEach((s) => s.services?.forEach((svc) => used.add(svc.id)));
    return services.filter((s) => used.has(s.id));
  }, [services, supervisors]);

  const activeService = serviceId !== ALL ? services.find((s) => s.id === serviceId) : null;

  const filtered = supervisors.filter((s) => {
    const matchesQuery =
      query === "" ||
      s.fullName.toLowerCase().includes(query.toLowerCase()) ||
      s.expertise.some((e) => e.toLowerCase().includes(query.toLowerCase()));
    const matchesExpertise = expertise === ALL || s.expertise.includes(expertise);
    const matchesService =
      serviceId === ALL ||
      (s.services?.some(
        (svc) =>
          svc.id === serviceId ||
          (activeService != null && (svc.slug === activeService.slug || svc.id === activeService.id))
      ) ??
        false);
    const matchesApproach = approach === ALL || s.approaches.includes(approach);
    return matchesQuery && matchesExpertise && matchesService && matchesApproach;
  });

  return (
    <>
      <section className="bg-navy-950 text-white pt-site-hero pb-20">
        <div className="container-wide">
          <Reveal>
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">
              Uzman Kadromuz
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 max-w-3xl leading-tight">
              Klinik Tecrübesiyle <br />
              <span className="text-navy-300">Öncü Süpervizörler</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-navy-200 text-lg max-w-2xl leading-relaxed">
              {activeService
                ? `${activeService.name} hizmeti veren süpervizörler listeleniyor.`
                : "Uzmanlık alanı, sağladığı hizmet ve terapi yaklaşımına göre filtreleyin."}
            </p>
          </Reveal>
          {activeService && (
            <Reveal delay={0.25}>
              <button
                type="button"
                onClick={() => {
                  setServiceId(ALL);
                  syncUrl({ hizmet: ALL });
                }}
                className="mt-4 text-xs font-bold uppercase tracking-widest text-navy-300 hover:text-white transition-colors"
              >
                Hizmet filtresini kaldır
              </button>
            </Reveal>
          )}

          <Reveal delay={0.3} className="mt-12">
            <div className="flex flex-col gap-4 max-w-5xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="İsim veya uzmanlık alanı ara..."
                  className="w-full bg-white/5 border border-white/10 rounded-premium pl-12 pr-6 py-4 text-white placeholder-navy-400 focus:outline-none focus:border-white/30 transition-colors"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    syncUrl({ q: e.target.value });
                  }}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  className="bg-white/5 border border-white/10 rounded-premium px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  value={expertise}
                  onChange={(e) => {
                    setExpertise(e.target.value);
                    syncUrl({ alan: e.target.value });
                  }}
                >
                  <option value={ALL} className="bg-navy-950">
                    Tüm Uzmanlık Alanları
                  </option>
                  {expertiseOptions.map((e) => (
                    <option key={e} value={e} className="bg-navy-950">
                      {e}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white/5 border border-white/10 rounded-premium px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    syncUrl({ hizmet: e.target.value });
                  }}
                >
                  <option value={ALL} className="bg-navy-950">
                    Tüm Hizmetler
                  </option>
                  {serviceOptions.map((s) => (
                    <option key={s.id} value={s.id} className="bg-navy-950">
                      {s.name}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white/5 border border-white/10 rounded-premium px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  value={approach}
                  onChange={(e) => {
                    setApproach(e.target.value);
                    syncUrl({ yaklasim: e.target.value });
                  }}
                >
                  <option value={ALL} className="bg-navy-950">
                    Tüm Terapi Yaklaşımları
                  </option>
                  {approachOptions.map((a) => (
                    <option key={a} value={a} className="bg-navy-950">
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          {fetchError || supervisors.length === 0 ? (
            <DbEmptyNotice
              loading={false}
              error={fetchError}
              emptyLabel="Henüz süpervizör yok. Panelim → Süpervizörler bölümünden ekleyin."
            />
          ) : (
            <>
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {filtered.map((s) => (
                  <StaggerItem key={s.id}>
                    <Link
                      href={supervisorProfileHref(s.id, activeService)}
                      className="card-premium p-0 overflow-hidden group h-full flex flex-col block cursor-pointer transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={s.photo}
                          alt={s.fullName}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-3 sm:p-5 lg:p-8">
                        <div className="text-[10px] sm:text-xs font-bold text-accent-gold uppercase tracking-widest mb-1 sm:mb-2 line-clamp-1">
                          {s.title}
                        </div>
                        <h3 className="text-sm sm:text-lg font-display font-bold text-navy-900 mb-2 sm:mb-4 line-clamp-2 leading-snug">{s.fullName}</h3>
                        <p className="hidden sm:block text-clinical-muted text-sm leading-relaxed mb-4 lg:mb-6 line-clamp-2">{s.bio}</p>
                        <div className="hidden sm:flex flex-wrap gap-2">
                          {s.expertise.slice(0, 3).map((e) => (
                            <span
                              key={e}
                              className="text-[10px] bg-navy-50 text-navy-700 px-2 py-1 rounded uppercase font-bold tracking-wider"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-clinical-muted">Aradığınız kriterlere uygun uzman bulunamadı.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
