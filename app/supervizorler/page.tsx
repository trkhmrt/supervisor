"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Star, ArrowUpRight, Search, Users, CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { useAppStore } from "@/lib/store";
import { useRemoteSupervisors } from "@/hooks/useRemoteSupervisors";

export default function SupervisorsPage() {
  const fallback = useAppStore((s) => s.supervisors);
  const supervisors = useRemoteSupervisors(fallback);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const allExpertise = useMemo(() => {
    const set = new Set<string>();
    supervisors.forEach((s) => s.expertise.forEach((e) => set.add(e)));
    return Array.from(set);
  }, [supervisors]);

  const filtered = supervisors.filter((s) => {
    const matchesQuery =
      query === "" ||
      s.fullName.toLowerCase().includes(query.toLowerCase()) ||
      s.expertise.some((e) => e.toLowerCase().includes(query.toLowerCase()));
    const matchesFilter = filter === "all" || s.expertise.includes(filter);
    return matchesQuery && matchesFilter;
  });

  return (
    <SiteShell>
      <section className="bg-navy-950 text-white pt-32 pb-20">
        <div className="container-wide">
          <Reveal>
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">Uzman Kadromuz</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 max-w-3xl leading-tight">
              Klinik Tecrübesiyle <br />
              <span className="text-navy-300">Öncü Süpervizörler</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-navy-200 text-lg max-w-2xl leading-relaxed">
              En az 10 yıl klinik deneyime sahip, etik ilkeleri benimsemiş ve 
              davet usulüyle seçilmiş uzmanlarımızla tanışın.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-12">
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input 
                  type="text" 
                  placeholder="İsim veya uzmanlık alanı ara..."
                  className="w-full bg-white/5 border border-white/10 rounded-premium pl-12 pr-6 py-4 text-white placeholder-navy-400 focus:outline-none focus:border-white/30 transition-colors"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select 
                className="bg-white/5 border border-white/10 rounded-premium px-6 py-4 text-white focus:outline-none focus:border-white/30 transition-colors md:w-64"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all" className="bg-navy-950">Tüm Uzmanlıklar</option>
                {allExpertise.map(e => (
                  <option key={e} value={e} className="bg-navy-950">{e}</option>
                ))}
              </select>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((s) => (
              <StaggerItem key={s.id}>
                <div className="card-premium p-0 overflow-hidden group">
                  <div className="relative aspect-square">
                    <Image 
                      src={s.photo} 
                      alt={s.fullName} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-navy-900 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="h-3 w-3 text-accent-blue" />
                      Doğrulanmış
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="text-xs font-bold text-accent-gold uppercase tracking-widest mb-2">{s.title}</div>
                    <h3 className="h3-premium mb-4">{s.fullName}</h3>
                    <p className="text-clinical-muted text-sm leading-relaxed mb-6 line-clamp-2">
                      {s.bio}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {s.expertise.slice(0, 3).map(e => (
                        <span key={e} className="text-[10px] bg-navy-50 text-navy-700 px-2 py-1 rounded uppercase font-bold tracking-wider">
                          {e}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-clinical-border">
                      <div className="flex items-center gap-2 text-clinical-muted text-xs">
                         <Users className="h-4 w-4" />
                         <span className="font-bold">{s.yearsExperience}+ Yıl Tecrübe</span>
                      </div>
                      <Link href={`/supervizorler/${s.id}`} className="btn-navy py-2 px-5 text-xs">
                        Profili Gör
                      </Link>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-clinical-muted">Aradığınız kriterlere uygun uzman bulunamadı.</p>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
