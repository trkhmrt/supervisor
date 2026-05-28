"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Clock, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils";
import type { Author, BlogPost } from "@/lib/types";

export function AuthorProfileClient({
  author,
  posts,
}: {
  author: Author;
  posts: BlogPost[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  function scrollSlider(dir: "left" | "right") {
    sliderRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  }

  return (
    <>
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
              <Reveal delay={0.1}>
                {author.title && (
                  <span className="text-navy-400 font-bold uppercase tracking-widest text-xs mb-4 block">
                    {author.title}
                  </span>
                )}
              </Reveal>
              <Reveal delay={0.2}>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">{author.fullName}</h1>
              </Reveal>
              <Reveal delay={0.3}>
                <p className="text-navy-200 text-lg leading-relaxed max-w-2xl">{author.bio}</p>
              </Reveal>
              {author.supervisorId && (
                <Reveal delay={0.4}>
                  <Link
                    href={`/supervizorler/${author.supervisorId}`}
                    className="btn-navy mt-8 inline-flex"
                  >
                    Süpervizör profiline git
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container-wide">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <Reveal>
                  <span className="eyebrow-premium">Yazılar</span>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 className="h2-premium">{author.fullName} tarafından yazılanlar</h2>
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
          </div>
        </section>
      )}
    </>
  );
}
