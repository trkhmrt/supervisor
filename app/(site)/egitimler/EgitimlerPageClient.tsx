"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Loader2, Users } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils";
import type { AdminCourse } from "@/lib/types";

export function EgitimlerPageClient() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/egitimler")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-navy-950 text-white pt-site-hero pb-20">
        <div className="container-wide">
          <Reveal>
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-navy-400">
              Eğitim Programları
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
              Süpervizörlerimizin eğitim ve atölye programları
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 max-w-xl text-navy-200">
              Aktif eğitimlere göz atın, program detaylarını inceleyin ve başvurunuzu iletin.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-clinical-light py-20">
        <div className="container-wide">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
            </div>
          ) : courses.length === 0 ? (
            <p className="py-12 text-center text-clinical-muted">
              Şu an listelenecek aktif eğitim yok.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <Reveal key={c.id}>
                  <Link
                    href={`/egitimler/${c.slug}`}
                    className="card-premium card-flat-hover group block h-full overflow-hidden p-0"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={c.cover}
                        alt={c.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="mb-2 text-xl font-bold text-navy-900 transition-colors group-hover:text-navy-700">
                        {c.title}
                      </h2>
                      <p className="mb-4 line-clamp-3 text-sm text-clinical-muted">{c.description}</p>
                      <div className="space-y-1 text-xs text-clinical-muted">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {c.supervisorName}
                        </div>
                        {c.startsAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(c.startsAt)}
                          </div>
                        )}
                        {c.maxParticipants != null && (
                          <div>
                            Kontenjan: {c.enrollmentCount ?? 0}/{c.maxParticipants}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
