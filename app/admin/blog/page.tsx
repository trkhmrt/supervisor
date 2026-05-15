"use client";

import { useState } from "react";
import { BookOpen, Plus, Search, Edit2, Trash2, Globe, Eye, MoreVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AdminBlog() {
  const posts = useAppStore((s) => s.blogPosts);
  const deletePost = useAppStore((s) => s.deleteBlogPost);
  const publishPost = useAppStore((s) => s.publishBlogPost);
  const [query, setQuery] = useState("");

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
         <h1 className="h2-premium text-3xl">İçerik Yönetimi</h1>
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-muted" />
               <input
                 placeholder="Başlık ara..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="bg-white border border-clinical-border rounded-premium pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-navy-900 w-64"
               />
            </div>
            <button className="btn-navy py-2 px-6 text-xs">
               <Plus className="h-4 w-4" /> Yeni Yazı
            </button>
         </div>
      </div>

      <div className="grid gap-8">
        {filtered.map((p) => (
          <div key={p.id} className="card-premium flex flex-col md:flex-row gap-8 group">
            <div className="relative w-full md:w-48 aspect-[16/10] rounded-premium overflow-hidden shrink-0">
               <img src={p.cover} alt={p.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
            </div>
            
            <div className="flex-1 flex flex-col">
               <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold">{p.category}</span>
                     <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                       p.published ? "bg-green-50 text-green-700 border-green-100" : "bg-clinical-light text-clinical-muted border-clinical-border"
                     }`}>
                        {p.published ? "Yayında" : "Taslak"}
                     </span>
                  </div>
                  <button className="p-2 text-clinical-muted hover:text-navy-900 transition-colors">
                     <MoreVertical className="h-4 w-4" />
                  </button>
               </div>
               
               <h3 className="text-xl font-bold text-navy-900 mb-2 group-hover:text-accent-blue transition-colors">{p.title}</h3>
               <p className="text-clinical-muted text-sm line-clamp-2 mb-6">{p.excerpt}</p>
               
               <div className="mt-auto flex items-center justify-between pt-6 border-t border-clinical-border">
                  <div className="text-[10px] font-bold text-clinical-muted uppercase tracking-widest">
                     {p.author} • {formatDate(p.publishedAt)}
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => publishPost(p.id, !p.published)} className="p-2 bg-clinical-light text-navy-900 rounded hover:bg-navy-900 hover:text-white transition-all">
                        {p.published ? <Eye className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                     </button>
                     <button className="p-2 bg-clinical-light text-navy-900 rounded hover:bg-navy-900 hover:text-white transition-all">
                        <Edit2 className="h-4 w-4" />
                     </button>
                    <button onClick={() => deletePost(p.id)} className="rounded bg-[#f1f0f0] p-2 text-black transition-all hover:bg-black hover:text-white">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
