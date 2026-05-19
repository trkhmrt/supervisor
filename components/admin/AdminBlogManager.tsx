"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  Eye,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { formatDate, readingTime } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

const CATEGORIES = ["Genel", "Süpervizyon", "Klinik", "Etik", "Mesleki Gelişim"];

type FormState = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover: string;
  author: string;
  category: string;
  tags: string;
  readingTime: number;
  published: boolean;
};

const emptyForm = (): FormState => ({
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
  author: "",
  category: "Genel",
  tags: "",
  readingTime: 5,
  published: false,
});

function postToForm(p: BlogPost): FormState {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    cover: p.cover,
    author: p.author,
    category: p.category,
    tags: p.tags.join(", "),
    readingTime: p.readingTime,
    published: p.published,
  };
}

const inputClass =
  "w-full rounded-premium border border-clinical-border bg-white px-4 py-2.5 text-sm focus:border-navy-900 focus:outline-none";

export function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Blog yazıları yüklenemedi");
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === ""
          ? true
          : statusFilter === "published"
            ? p.published
            : !p.published;
      return matchQ && matchStatus;
    });
  }, [posts, search, statusFilter]);

  async function savePost(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Başlık zorunludur.");
      return;
    }
    setSaving(true);
    setError(null);
    const minutes =
      form.readingTime > 0
        ? form.readingTime
        : readingTime(`${form.excerpt} ${form.content}`);
    const payload = {
      id: form.id || undefined,
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover: form.cover.trim(),
      author: form.author.trim() || "Süpervizyon",
      category: form.category.trim() || "Genel",
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      readingTime: minutes,
      published: form.published,
    };
    try {
      const res = await fetch(
        form.id ? `/api/admin/blog/${form.id}` : "/api/admin/blog",
        {
          method: form.id ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi");
      setFormOpen(false);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt hatası");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, published: !post.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Güncellenemedi");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    }
  }

  async function deletePost(id: string) {
    if (!window.confirm("Bu yazı silinsin mi?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Silinemedi");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    }
  }

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h2-premium text-3xl">Blog</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Yazı ekleyin, düzenleyin ve yayınlayın. Yayınlanan yazılar sitede görünür.
          </p>
        </div>
        <button
          type="button"
          className="btn-navy shrink-0 gap-2 py-2 px-6 text-xs"
          onClick={() => {
            setForm(emptyForm());
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Yeni Yazı
        </button>
      </div>

      {error && (
        <p className="mb-6 rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Başlık, özet veya yazar ara…"
        selectLabel="Durum"
        selectValue={statusFilter}
        selectOptions={[
          { value: "", label: "Tümü" },
          { value: "published", label: "Yayında" },
          { value: "draft", label: "Taslak" },
        ]}
        onSelectChange={setStatusFilter}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-clinical-muted">
          Veritabanında henüz blog yazısı yok.{" "}
          <button
            type="button"
            className="font-bold text-navy-900 underline"
            onClick={() => {
              setForm(emptyForm());
              setFormOpen(true);
            }}
          >
            Yeni Yazı
          </button>{" "}
          ile ekleyebilir veya demo içerik için{" "}
          <code className="rounded bg-clinical-light px-1.5 py-0.5 text-xs">npm run seed:demo</code>{" "}
          çalıştırabilirsiniz.
        </p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-clinical-muted">
          Arama veya filtreye uygun yazı bulunamadı.
        </p>
      ) : (
        <div className="grid gap-8">
          {filtered.map((p) => (
            <div key={p.id} className="card-premium group flex flex-col gap-8 md:flex-row">
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-premium md:w-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold">
                      {p.category}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                        p.published
                          ? "border-green-100 bg-green-50 text-green-700"
                          : "border-clinical-border bg-clinical-light text-clinical-muted"
                      }`}
                    >
                      {p.published ? "Yayında" : "Taslak"}
                    </span>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-navy-900">{p.title}</h3>
                <p className="mb-6 line-clamp-2 text-sm text-clinical-muted">{p.excerpt}</p>
                <div className="mt-auto flex items-center justify-between border-t border-clinical-border pt-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    {p.author} • {formatDate(p.publishedAt)}
                  </div>
                  <div className="flex gap-2">
                    {p.published && (
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        className="rounded bg-clinical-light p-2 text-navy-900 transition-all hover:bg-navy-900 hover:text-white"
                        title="Sitede gör"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => void togglePublish(p)}
                      className="rounded bg-clinical-light p-2 text-navy-900 transition-all hover:bg-navy-900 hover:text-white"
                      title={p.published ? "Yayından kaldır" : "Yayınla"}
                    >
                      {p.published ? <Eye className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(postToForm(p));
                        setFormOpen(true);
                      }}
                      className="rounded bg-clinical-light p-2 text-navy-900 transition-all hover:bg-navy-900 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deletePost(p.id)}
                      className="rounded bg-[#f1f0f0] p-2 text-black transition-all hover:bg-black hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setFormOpen(false)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-premium bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-900">
                {form.id ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-clinical-muted hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => void savePost(e)} className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  Başlık *
                </span>
                <input
                  className={`${inputClass} mt-1`}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  URL slug (isteğe bağlı)
                </span>
                <input
                  className={`${inputClass} mt-1`}
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="otomatik oluşturulur"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                    Kategori
                  </span>
                  <select
                    className={`${inputClass} mt-1`}
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                    Yazar
                  </span>
                  <input
                    className={`${inputClass} mt-1`}
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  Kapak görseli URL
                </span>
                <input
                  className={`${inputClass} mt-1`}
                  value={form.cover}
                  onChange={(e) => setForm((f) => ({ ...f, cover: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  Özet
                </span>
                <textarea
                  className={`${inputClass} mt-1 min-h-[80px]`}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  İçerik (paragraflar için boş satır bırakın)
                </span>
                <textarea
                  className={`${inputClass} mt-1 min-h-[200px] font-mono text-sm`}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                  Etiketler (virgülle)
                </span>
                <input
                  className={`${inputClass} mt-1`}
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                />
              </label>
              <div className="flex flex-wrap items-center gap-6">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-clinical-muted">
                    Okuma süresi (dk)
                  </span>
                  <input
                    type="number"
                    min={1}
                    className={`${inputClass} mt-1 w-24`}
                    value={form.readingTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, readingTime: Number(e.target.value) || 5 }))
                    }
                  />
                </label>
                <label className="flex items-center gap-2 pt-6 text-sm font-semibold text-navy-900">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  />
                  Yayında göster
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="btn-navy gap-2 text-xs">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Kaydet
                </button>
                <button
                  type="button"
                  className="btn-outline-navy text-xs"
                  onClick={() => setFormOpen(false)}
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
