"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  Heart,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal";
import {
  DEFAULT_FOUNDER_PROFILE,
  isFounderAuthor,
  type FounderPageContent,
} from "@/lib/content/founder-profile";
import { formatDate } from "@/lib/utils";
import type { Author, BlogPost, Supervisor } from "@/lib/types";

const PILLAR_ICONS = [ShieldCheck, Compass, Sparkles, Users] as const;

export function AuthorProfileClient({
  author,
  posts,
  supervisor,
  founderContent,
}: {
  author: Author;
  posts: BlogPost[];
  supervisor?: Supervisor | null;
  founderContent?: FounderPageContent | null;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isFounder = isFounderAuthor(author.slug);
  const profile = founderContent ?? DEFAULT_FOUNDER_PROFILE;

  function scrollSlider(dir: "left" | "right") {
    sliderRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  }

  if (isFounder) {
    return (
      <>
        <FounderHero author={author} supervisor={supervisor} profile={profile} />
        <FounderPersonalStorySection author={author} profile={profile} />
        <FounderVisionSection author={author} profile={profile} />
        <FounderPillarsSection profile={profile} />
        <FounderMissionSection profile={profile} />
        {supervisor && <FounderExpertiseSection supervisor={supervisor} />}
        <FounderCtaSection author={author} supervisor={supervisor} profile={profile} />
        {posts.length > 0 && (
          <BlogPostsSection
            author={author}
            posts={posts}
            sliderRef={sliderRef}
            scrollSlider={scrollSlider}
            title="Kurucudan yazılar"
            eyebrow="Blog & Perspektif"
          />
        )}
      </>
    );
  }

  return (
    <>
      <GenericAuthorHero author={author} />
      {posts.length > 0 && (
        <BlogPostsSection
          author={author}
          posts={posts}
          sliderRef={sliderRef}
          scrollSlider={scrollSlider}
          title={`${author.fullName} tarafından yazılanlar`}
          eyebrow="Yazılar"
        />
      )}
    </>
  );
}

function FounderHero({
  author,
  supervisor,
  profile,
}: {
  author: Author;
  supervisor?: Supervisor | null;
  profile: FounderPageContent;
}) {
  return (
    <section className="bg-navy-950 text-white pt-site-hero pb-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_55%)]" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-white/[0.03] -skew-y-6 -translate-x-1/4" />
      <div className="container-wide relative z-10">
        <Reveal>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy-400 text-xs font-bold uppercase tracking-widest hover:text-white mb-10"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Link>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-14 lg:gap-20 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <Reveal delay={0.1}>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-gold/40 bg-accent-gold/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-accent-gold mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                {profile.roleBadge} · {profile.platformLabel}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                {author.fullName}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-xl md:text-2xl text-navy-200 font-display leading-snug mb-6">
                {profile.headline}
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-navy-300 leading-relaxed max-w-xl mb-8">{profile.intro}</p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-wrap gap-4 mb-8">
                {author.title && (
                  <span className="inline-flex items-center gap-2 rounded-premium bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold">
                    <Award className="h-4 w-4 text-navy-400" />
                    {author.title}
                  </span>
                )}
                {supervisor && (
                  <span className="inline-flex items-center gap-2 rounded-premium bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold">
                    <Heart className="h-4 w-4 text-accent-gold" />
                    {supervisor.yearsExperience}+ yıl klinik deneyim
                  </span>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="flex flex-wrap gap-3">
                {author.supervisorId && (
                  <Link href={`/supervizorler/${author.supervisorId}`} className="btn-white">
                    Süpervizör profili
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                <Link href="/hakkimizda" className="btn-outline-navy border-white/30 text-white hover:bg-white/10">
                  Platform hakkında
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <Reveal delay={0.15} scale={0.97}>
              <div className="relative mx-auto max-w-md lg:max-w-none lg:ml-auto">
                <div className="absolute -inset-4 rounded-premium bg-gradient-to-br from-accent-gold/20 via-transparent to-white/5 blur-2xl" />
                <div className="relative aspect-[4/5] max-h-[520px] rounded-premium overflow-hidden shadow-2xl border border-white/15">
                  <Image
                    src={author.photo}
                    alt={author.fullName}
                    fill
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-transparent p-6 pt-20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold mb-1">
                      Kurucu
                    </p>
                    <p className="font-display text-xl font-bold">{author.fullName}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderPersonalStorySection({
  author,
  profile,
}: {
  author: Author;
  profile: FounderPageContent;
}) {
  const { personalStory } = profile;

  return (
    <section className="py-24 bg-clinical-light border-b border-clinical-border">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <span className="eyebrow-premium">{personalStory.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="h2-premium mt-4 mb-10">{personalStory.title}</h2>
          </Reveal>

          <div className="card-premium !p-8 md:!p-12 space-y-6">
            {personalStory.paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={0.1 + i * 0.06}>
                <p
                  className={`text-clinical-text leading-[1.85] ${
                    i === 0 ? "text-lg md:text-xl font-medium text-navy-900" : "text-base md:text-lg"
                  }`}
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={0.4}>
              <div className="border-t border-clinical-border pt-8 mt-8">
                <p className="text-clinical-text italic leading-relaxed">{personalStory.closing}</p>
                <p className="mt-6 font-display text-xl font-bold text-navy-900">{author.fullName}</p>
                <p className="text-sm text-clinical-muted mt-1">
                  Kurucu, {profile.platformLabel}
                  {author.title ? ` · ${author.title}` : ""}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderVisionSection({
  author,
  profile,
}: {
  author: Author;
  profile: FounderPageContent;
}) {
  return (
    <section className="py-24 bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <Reveal>
              <span className="eyebrow-premium">Kurucunun hikayesi</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2-premium mt-4">{profile.visionTitle}</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <blockquote className="mt-10 border-l-4 border-accent-gold pl-6">
                <Quote className="h-8 w-8 text-accent-gold/40 mb-4" />
                <p className="text-lg italic text-clinical-text leading-relaxed">
                  &ldquo;{profile.quote}&rdquo;
                </p>
                <footer className="mt-4 text-sm font-bold text-navy-900">— {author.fullName}</footer>
              </blockquote>
            </Reveal>
          </div>
          <div className="lg:col-span-7 space-y-6">
            {profile.visionText.map((paragraph, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08}>
                <p className="text-clinical-text text-lg leading-relaxed">{paragraph}</p>
              </Reveal>
            ))}
            <Reveal delay={0.35}>
              <div className="card-premium bg-clinical-light mt-8">
                <p className="text-sm font-bold uppercase tracking-widest text-navy-500 mb-3">
                  Klinik yaklaşım
                </p>
                <p className="text-clinical-text leading-relaxed">{author.bio}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderPillarsSection({ profile }: { profile: FounderPageContent }) {
  return (
    <section className="py-24 bg-clinical-light border-y border-clinical-border">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <span className="eyebrow-premium">Değerlerimiz</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="h2-premium">Girişimin omurgası</h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 text-clinical-muted">
              Süpervizyon platformunu inşa ederken her kararımızda rehber aldığımız ilkeler.
            </p>
          </Reveal>
        </div>
        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profile.pillars.map((pillar, i) => {
            const Icon = PILLAR_ICONS[i] ?? ShieldCheck;
            return (
              <StaggerItem key={pillar.title}>
                <div className="card-premium h-full">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-premium bg-navy-50 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2">{pillar.title}</h3>
                  <p className="text-sm text-clinical-muted leading-relaxed">{pillar.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

function FounderMissionSection({ profile }: { profile: FounderPageContent }) {
  return (
    <section className="py-24 bg-navy-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/3" />
      <div className="container-wide relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="text-navy-400 font-bold uppercase tracking-widest text-xs">
              {profile.missionTitle}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold leading-tight">
              Mesleki gelişim için güvenilir bir adres
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-navy-200 text-lg leading-relaxed">{profile.missionText}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FounderExpertiseSection({ supervisor }: { supervisor: Supervisor }) {
  return (
    <section className="py-24 bg-white">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <Reveal>
              <span className="eyebrow-premium">Uzmanlık alanları</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="h2-premium mt-4">Klinik odak noktaları</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-4 text-clinical-muted leading-relaxed">
                Kurucu olarak hem platformu yönetiyor hem de aktif klinik süpervizyon pratiğini
                sürdürüyorum.
              </p>
            </Reveal>
          </div>
          <div className="space-y-8">
            <Reveal delay={0.1}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy-500 mb-3">
                  Uzmanlık
                </p>
                <div className="flex flex-wrap gap-2">
                  {supervisor.expertise.map((e) => (
                    <span
                      key={e}
                      className="rounded-premium bg-navy-50 border border-navy-100 px-3 py-1.5 text-sm font-medium text-navy-900"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy-500 mb-3">
                  Yaklaşımlar
                </p>
                <div className="flex flex-wrap gap-2">
                  {supervisor.approaches.map((a) => (
                    <span
                      key={a}
                      className="rounded-premium border border-clinical-border px-3 py-1.5 text-sm font-medium text-navy-900"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            {supervisor.license && (
              <Reveal delay={0.2}>
                <p className="text-sm text-clinical-muted">
                  <span className="font-semibold text-navy-900">Lisans: </span>
                  {supervisor.license}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderCtaSection({
  author,
  supervisor,
  profile,
}: {
  author: Author;
  supervisor?: Supervisor | null;
  profile: FounderPageContent;
}) {
  return (
    <section className="py-20 bg-clinical-light border-t border-clinical-border">
      <div className="container-wide">
        <Reveal>
          <div className="card-premium flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 !p-8 lg:!p-12">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent-gold mb-2">
                {profile.roleBadge}
              </p>
              <h2 className="h2-premium text-2xl md:text-3xl">
                {author.fullName} ile tanışın
              </h2>
              <p className="mt-3 text-clinical-muted">
                Süpervizyon randevusu almak veya platformu keşfetmek için aşağıdaki bağlantıları
                kullanabilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              {author.supervisorId && supervisor && (
                <Link
                  href={`/supervizorler/${author.supervisorId}/randevu?service=bireysel-supervizyon`}
                  className="btn-navy"
                >
                  Randevu al
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {author.supervisorId && (
                <Link href={`/supervizorler/${author.supervisorId}`} className="btn-outline-navy">
                  Süpervizör profili
                </Link>
              )}
              <Link href="/supervizorler" className="btn-outline-navy">
                Tüm süpervizörler
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GenericAuthorHero({ author }: { author: Author }) {
  return (
    <section className="bg-navy-950 text-white pt-site-hero pb-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
      <div className="container-wide relative z-10">
        <Reveal>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-navy-400 text-xs font-bold uppercase tracking-widest hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Blog
          </Link>
        </Reveal>
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 mx-auto w-full max-w-[280px] lg:mx-0">
            <Reveal y={30}>
              <div className="relative aspect-[3/4] rounded-premium overflow-hidden shadow-2xl border border-white/10">
                <Image src={author.photo} alt={author.fullName} fill className="object-cover" priority />
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            {author.title && (
              <Reveal delay={0.1}>
                <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">
                  {author.title}
                </span>
              </Reveal>
            )}
            <Reveal delay={0.2}>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">{author.fullName}</h1>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-navy-200 text-lg leading-relaxed max-w-2xl">{author.bio}</p>
            </Reveal>
            {author.supervisorId && (
              <Reveal delay={0.4}>
                <Link href={`/supervizorler/${author.supervisorId}`} className="btn-navy mt-8 inline-flex">
                  Süpervizör profiline git
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogPostsSection({
  author,
  posts,
  sliderRef,
  scrollSlider,
  title,
  eyebrow,
}: {
  author: Author;
  posts: BlogPost[];
  sliderRef: React.RefObject<HTMLDivElement | null>;
  scrollSlider: (dir: "left" | "right") => void;
  title: string;
  eyebrow: string;
}) {
  return (
    <section className="py-24 bg-white">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <Reveal>
              <span className="eyebrow-premium">{eyebrow}</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="h2-premium">{title}</h2>
            </Reveal>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              className="rounded-full border border-clinical-border p-2 hover:bg-clinical-light"
              aria-label="Önceki"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              className="rounded-full border border-clinical-border p-2 hover:bg-clinical-light"
              aria-label="Sonraki"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        >
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="min-w-[300px] max-w-[340px] shrink-0 snap-start"
            >
              <Link href={`/blog/${post.slug}`} className="card-premium block h-full overflow-hidden group">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-navy-500">
                    {post.category}
                  </span>
                  <h3 className="mt-2 font-bold text-navy-900 line-clamp-2 group-hover:text-navy-600">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-clinical-muted line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-clinical-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} dk
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-8 text-center">
            <Link href="/blog" className="btn-outline-navy py-2 px-6 text-xs inline-flex">
              Tüm yazılar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
