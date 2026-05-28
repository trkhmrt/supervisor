"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Loader2, Users } from "lucide-react";
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
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">
              Eğitim Programları
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-display font-bold max-w-2xl leading-tight">
              Süpervizörlerimizin eğitim ve atölye programları
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 text-navy-200 max-w-xl">
              Aktif eğitimlere göz atın, detayları inceleyin ve başvurunuzu iletin.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 bg-clinical-light">
        <div className="container-wide">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-clinical-muted py-12">
              Şu an listelenecek aktif eğitim yok.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <Reveal key={c.id}>
                  <Link
                    href={`/egitimler/${c.slug}`}
                    className="card-premium card-flat-hover block h-full p-6"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-navy-900 mb-2">{c.title}</h2>
                    <p className="text-sm text-clinical-muted line-clamp-3 mb-4">{c.description}</p>
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
