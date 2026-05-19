import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

function blogRowToApi(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  readingTime: number;
  published: boolean;
}): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    cover: row.cover,
    author: row.author,
    category: row.category,
    tags: row.tags,
    publishedAt: row.publishedAt.toISOString(),
    readingTime: row.readingTime,
    published: row.published,
  };
}

export async function listPublishedPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(blogRowToApi);
}

export async function listAllPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  return rows.map(blogRowToApi);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? blogRowToApi(row) : null;
}

export async function upsertBlogPost(data: Partial<BlogPost> & { title: string }): Promise<BlogPost> {
  const slug = slugify(data.slug || data.title) || "yazi";
  const payload = {
    title: data.title.trim(),
    slug,
    excerpt: (data.excerpt ?? "").trim(),
    content: (data.content ?? "").trim(),
    cover: (data.cover ?? "/images/blog-default.jpg").trim(),
    author: (data.author ?? "Süpervizyon").trim(),
    category: (data.category ?? "Genel").trim(),
    tags: data.tags ?? [],
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    readingTime: data.readingTime ?? 5,
    published: data.published ?? false,
  };

  if (data.id) {
    const row = await prisma.blogPost.update({
      where: { id: data.id },
      data: payload,
    });
    return blogRowToApi(row);
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  const row = await prisma.blogPost.create({
    data: { ...payload, slug: finalSlug },
  });
  return blogRowToApi(row);
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const result = await prisma.blogPost.deleteMany({ where: { id } });
  return result.count > 0;
}
