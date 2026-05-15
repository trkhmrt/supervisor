"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Search, Clock, Calendar } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const posts = useAppStore((s) => s.blogPosts.filter((p) => p.published));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const filtered = posts.filter((p) => {
    const q = query.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
    const matchC = filter === "all" || p.category === filter;
    return matchQ && matchC;
  });

  return (
    <SiteShell>
      <section className="bg-navy-950 text-white pt-32 pb-20">
        <div className="container-wide">
          <Reveal>
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">Yayınlarımız</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-8 max-w-3xl leading-tight">
              Klinik İçgörüler ve <br />
              <span className="text-navy-300">Mesleki Gelişim</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-navy-200 text-lg max-w-2xl leading-relaxed">
              Süpervizyon süreçleri, vaka değerlendirmeleri ve ruh sağlığı 
              alanındaki güncel gelişmelere dair uzman görüşleri.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-12">
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input 
                  type="text" 
                  placeholder="Yazılarda ara..."
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
                <option value="all" className="bg-navy-950">Tüm Kategoriler</option>
                {categories.map(c => (
                  <option key={c} value={c} className="bg-navy-950">{c}</option>
                ))}
              </select>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container-wide">
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((p) => (
              <StaggerItem key={p.id}>
                <Link href={`/blog/${p.slug}`} className="group block h-full">
                  <div className="card-premium p-0 overflow-hidden h-full flex flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image 
                        src={p.cover} 
                        alt={p.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-navy-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-premium">
                        {p.category}
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 text-clinical-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                         <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {formatDate(p.publishedAt)}
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {p.readingTime} DK Okuma
                         </div>
                      </div>
                      <h3 className="h3-premium mb-4 group-hover:text-accent-blue transition-colors">{p.title}</h3>
                      <p className="text-clinical-muted text-sm leading-relaxed mb-8 line-clamp-3">
                        {p.excerpt}
                      </p>
                      <div className="mt-auto pt-6 border-t border-clinical-border flex items-center justify-between text-navy-900 font-bold text-sm">
                         Okumaya Devam Et
                         <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-clinical-muted">Aradığınız kriterlere uygun yazı bulunamadı.</p>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
