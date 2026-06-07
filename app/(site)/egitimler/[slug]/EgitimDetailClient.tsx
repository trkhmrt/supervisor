"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { CourseLearningOutcomesSection } from "@/components/site/CourseLearningOutcomesSection";
import { formatDate } from "@/lib/utils";
import { CourseApplyButton } from "./CourseApplyButton";
import type { PublicCourseDetail } from "@/lib/types";

function formatDateRange(startsAt: string | null | undefined, endsAt: string | null | undefined) {
  if (startsAt && endsAt) return `${formatDate(startsAt)} – ${formatDate(endsAt)}`;
  if (startsAt) return formatDate(startsAt);
  if (endsAt) return formatDate(endsAt);
  return null;
}

function splitDescription(text: string): { lead: string; paragraphs: string[] } {
  const parts = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { lead: "", paragraphs: [] };
  if (parts.length === 1) return { lead: parts[0], paragraphs: [] };
  return { lead: parts[0], paragraphs: parts.slice(1) };
}

export function EgitimDetailClient({ course }: { course: PublicCourseDetail }) {
  const instructor = course.supervisorProfile;
  const learningOutcomes = course.learningOutcomes ?? [];
  const dateRange = formatDateRange(course.startsAt, course.endsAt);
  const { lead, paragraphs } = splitDescription(course.description);
  const spotsLeft =
    course.maxParticipants != null
      ? Math.max(0, course.maxParticipants - (course.enrollmentCount ?? 0))
      : null;
  const canApply = course.acceptsApplications && spotsLeft !== 0;

  return (
    <article>
      <section className="relative overflow-hidden bg-navy-950 text-white pt-site-hero pb-16">
        <div className="absolute inset-0 -z-0">
          <Image src={course.cover} alt="" fill className="object-cover opacity-20" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-950/80" />
        </div>
        <div className="container-wide relative z-10">
          <Reveal>
            <Link
              href="/egitimler"
              className="mb-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Eğitimler
            </Link>
          </Reveal>

          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal delay={0.05}>
                <span className="mb-4 inline-flex items-center gap-2 rounded-premium border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-navy-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Eğitim programı
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="font-display text-4xl font-bold leading-[1.1] md:text-5xl lg:text-6xl">
                  {course.title}
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">{lead}</p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <MetaPill icon={Users} label={instructor.fullName} />
                  {dateRange && <MetaPill icon={Calendar} label={dateRange} />}
                  {course.maxParticipants != null && (
                    <MetaPill
                      icon={CheckCircle2}
                      label={`${course.enrollmentCount ?? 0}/${course.maxParticipants} kayıt`}
                    />
                  )}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.25} y={24}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-premium border border-white/10 shadow-2xl lg:aspect-[5/4]">
                  <Image
                    src={course.cover}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-wide">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-14">
              {learningOutcomes.length > 0 && (
                <Reveal>
                  <CourseLearningOutcomesSection items={learningOutcomes} />
                </Reveal>
              )}

              {paragraphs.length > 0 && (
                <Reveal delay={learningOutcomes.length > 0 ? 0.05 : 0}>
                  <div>
                    <span className="eyebrow-premium">Program içeriği</span>
                    <div className="space-y-5 text-base leading-loose text-clinical-text">
                      {paragraphs.map((p) => (
                        <p key={p.slice(0, 40)}>{p}</p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {instructor.expertise.length > 0 && learningOutcomes.length === 0 && (
                <Reveal delay={0.05}>
                  <CourseLearningOutcomesSection
                    items={instructor.expertise}
                    title="Çalışılacak başlıklar"
                  />
                </Reveal>
              )}

              <Reveal delay={0.1}>
                <div className="rounded-premium border border-clinical-border bg-clinical-light p-8 md:p-10">
                  <span className="eyebrow-premium">Başvuru süreci</span>
                  <div className="space-y-8">
                    <ProcessStep
                      n="01"
                      title="Başvurunuzu gönderin"
                      desc="Giriş yaptıktan sonra tek tıkla başvurun. Ek bilgi gerekmez."
                    />
                    <ProcessStep
                      n="02"
                      title="Eğitmen değerlendirmesi"
                      desc={`${instructor.fullName.split(" ")[0]} başvurunuzu inceler ve uygunluk durumunu bildirir.`}
                    />
                    <ProcessStep
                      n="03"
                      title="Programa katılım"
                      desc="Onay sonrası program detayları ve iletişim bilgileri tarafınıza iletilir."
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32">
                <Reveal delay={0.15}>
                  <div className="overflow-hidden rounded-premium border border-navy-900 bg-navy-950 text-white shadow-premium">
                    <div className="border-b border-white/10 px-6 py-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">
                        Program özeti
                      </p>
                    </div>
                    <ul className="space-y-0 divide-y divide-white/10 px-6">
                      <SummaryRow label="Eğitmen" value={instructor.fullName} />
                      <SummaryRow label="Tarih" value={dateRange ?? "Yakında duyurulacak"} />
                      <SummaryRow
                        label="Kontenjan"
                        value={
                          course.maxParticipants != null
                            ? `${course.enrollmentCount ?? 0} / ${course.maxParticipants}`
                            : "Sınırlı"
                        }
                      />
                      <SummaryRow
                        label="Durum"
                        value={
                          !course.acceptsApplications
                            ? "Başvuru kapalı"
                            : spotsLeft === 0
                              ? "Kontenjan doldu"
                              : "Başvurular açık"
                        }
                        highlight={canApply}
                      />
                    </ul>
                    <div className="border-t border-white/10 p-6">
                      {canApply ? (
                        <CourseApplyButton courseId={course.id} variant="onDark" />
                      ) : (
                        <p className="rounded-premium border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-navy-300">
                          {!course.acceptsApplications
                            ? "Bu programa şu an başvuru alınmıyor."
                            : "Kontenjan dolmuştur."}
                        </p>
                      )}
                      {spotsLeft != null && spotsLeft > 0 && canApply && (
                        <p className="mt-3 text-center text-xs text-navy-400">
                          {spotsLeft} kontenjan kaldı
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-clinical-border bg-clinical-light py-20">
        <div className="container-wide">
          <Reveal>
            <span className="eyebrow-premium">Eğitmen</span>
            <h2 className="h2-premium mb-10">Programı veren uzman</h2>
          </Reveal>

          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4 mx-auto w-full max-w-[280px] lg:mx-0">
              <Reveal y={30}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-premium border border-clinical-border shadow-premium">
                  <Image
                    src={instructor.photo}
                    alt={instructor.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={0.1}>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  {instructor.title}
                </p>
                <h3 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">
                  {instructor.fullName}
                </h3>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-navy-900 text-navy-900" />
                    <span className="font-bold text-navy-900">{instructor.rating}</span>
                    <span className="text-sm text-clinical-muted">
                      ({instructor.reviewCount} değerlendirme)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-clinical-muted">
                    <Award className="h-5 w-5" />
                    <span className="font-bold text-navy-900">{instructor.yearsExperience}+</span>
                    yıl klinik deneyim
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mt-8 max-w-2xl text-base leading-loose text-clinical-text">
                  {instructor.bio}
                </p>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href={`/supervizorler/${instructor.id}`} className="btn-navy">
                    Süpervizör profili
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/supervizorler/${instructor.id}/randevu`}
                    className="btn-outline-navy"
                  >
                    Randevu al
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function MetaPill({
  icon: Icon,
  label,
}: {
  icon: typeof Users;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-premium border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-navy-200">
      <Icon className="h-3.5 w-3.5 text-navy-400" />
      {label}
    </span>
  );
}

function ProcessStep({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6">
      <span className="font-display text-3xl font-bold leading-none text-navy-900/20">{n}</span>
      <div>
        <h4 className="mb-2 font-bold text-navy-900">{title}</h4>
        <p className="text-sm leading-relaxed text-clinical-muted">{desc}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4 py-4">
      <span className="text-xs font-bold uppercase tracking-widest text-navy-400">{label}</span>
      <span
        className={`text-right text-sm font-semibold ${highlight ? "text-[#d1f90b]" : "text-white"}`}
      >
        {value}
      </span>
    </li>
  );
}
