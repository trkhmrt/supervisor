"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Twitter, Facebook, Linkedin, Link2, Calendar, Clock, User, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { formatDate } from "@/lib/utils";
import { blogContentToHtml } from "@/lib/blog-content";
import type { BlogPost } from "@/lib/types";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [otherPosts, setOtherPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setMissing(false);
    void Promise.all([
      fetch(`/api/blog/${slug}`).then(async (r) => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error("load");
        return r.json() as Promise<BlogPost>;
      }),
      fetch("/api/blog")
        .then((r) => (r.ok ? r.json() : []))
        .then((list: BlogPost[]) => list.filter((p) => p.slug !== slug).slice(0, 3)),
    ])
      .then(([article, others]) => {
        if (!article) {
          setMissing(true);
          setPost(null);
        } else {
          setPost(article);
          setOtherPosts(others);
        }
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (missing || !post) notFound();

  const contentHtml = blogContentToHtml(post.content);

  return (
      <article className="bg-white">
        {/* HEADER */}
        <section className="bg-navy-950 text-white pt-32 pb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 -z-0 skew-x-12 translate-x-1/2" />
          <div className="container-wide relative z-10">
            <Reveal>
              <Link href="/blog" className="inline-flex items-center gap-2 text-navy-400 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors mb-12">
                <ArrowLeft className="h-4 w-4" /> Tüm Yazılar
              </Link>
            </Reveal>
            
            <div className="max-w-4xl">
               <Reveal delay={0.1}>
                  <span className="bg-white/10 backdrop-blur border border-white/10 px-3 py-1 rounded-premium text-[10px] font-bold uppercase tracking-[0.2em] text-navy-300 mb-6 inline-block">
                     {post.category}
                  </span>
               </Reveal>
               <Reveal delay={0.2}>
                  <h1 className="text-4xl md:text-6xl font-display font-bold mb-10 leading-tight">
                     {post.title}
                  </h1>
               </Reveal>
               
               <Reveal delay={0.3}>
                  <div className="flex flex-wrap items-center gap-8 text-navy-300 text-sm font-bold uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-navy-500" />
                        {post.author}
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-navy-500" />
                        {formatDate(post.publishedAt)}
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-navy-500" />
                        {post.readingTime} DK Okuma
                     </div>
                  </div>
               </Reveal>
            </div>
          </div>
        </section>

        {/* IMAGE */}
        <section className="-mt-16 relative z-20">
           <div className="container-wide">
              <Reveal delay={0.4} y={40}>
                 <div className="relative aspect-[21/9] rounded-premium overflow-hidden shadow-2xl border-4 border-white">
                    <Image src={post.cover} alt={post.title} fill className="object-cover" priority />
                 </div>
              </Reveal>
           </div>
        </section>

        {/* CONTENT */}
        <section className="py-24">
           <div className="container-wide">
              <div className="grid lg:grid-cols-12 gap-16">
                 {/* Sidebar / Share */}
                 <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-32 flex flex-col items-center gap-6">
                       <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted rotate-90 mb-8 whitespace-nowrap">Paylaş</div>
                       <ShareLink Icon={Twitter} />
                       <ShareLink Icon={Facebook} />
                       <ShareLink Icon={Linkedin} />
                       <ShareLink Icon={Link2} />
                    </div>
                 </div>

                 {/* Main Content */}
                 <div className="lg:col-span-8">
                    <div className="prose prose-lg prose-navy max-w-none">
                       <p className="text-xl text-navy-900 font-medium leading-relaxed mb-12">
                          {post.excerpt}
                       </p>
                       <div className="text-clinical-text leading-loose space-y-8" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    </div>
                    
                    <div className="mt-20 pt-12 border-t border-clinical-border flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center text-navy-900 font-bold">
                             {post.author[0]}
                          </div>
                          <div>
                             <div className="text-sm font-bold text-navy-900">{post.author}</div>
                             <div className="text-xs text-clinical-muted">Klinik Süpervizör</div>
                          </div>
                       </div>
                       <button className="btn-outline-navy gap-2 text-xs">
                          <Share2 className="h-4 w-4" /> Paylaş
                       </button>
                    </div>
                 </div>

                 {/* Related */}
                 <div className="lg:col-span-3">
                    <div className="sticky top-32">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-navy-900 mb-8 pb-4 border-b border-navy-900">İlginizi Çekebilir</h4>
                       <div className="space-y-10">
                          {otherPosts.map(p => (
                             <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-accent-gold mb-2">{p.category}</div>
                                <h5 className="font-display font-bold text-navy-900 group-hover:text-accent-blue transition-colors leading-tight mb-3">
                                   {p.title}
                                </h5>
                                <div className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest">{formatDate(p.publishedAt)}</div>
                             </Link>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </article>
  );
}

function ShareLink({ Icon }: { Icon: any }) {
   return (
      <button className="w-10 h-10 rounded-full border border-clinical-border flex items-center justify-center text-clinical-muted hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all duration-300">
         <Icon className="h-4 w-4" />
      </button>
   )
}
