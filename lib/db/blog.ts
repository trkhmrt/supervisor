import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

export type BlogPostDbRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  author: string;
  authorId: string | null;
  category: string;
  tags: string[];
  publishedAt: Date;
  readingTime: number;
  published: boolean;
};

async function authorSlugMapFromRows(rows: { authorId: string | null }[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.authorId).filter((id): id is string => id != null))];
  if (!ids.length) return new Map();
  const list = await prisma.author.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true },
  });
  return new Map(list.map((a) => [a.id, a.slug]));
}

function blogRowToApi(row: BlogPostDbRow, slugByAuthorId: Map<string, string>): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    cover: row.cover,
    author: row.author,
    authorId: row.authorId ?? undefined,
    authorSlug: row.authorId ? slugByAuthorId.get(row.authorId) : undefined,
    category: row.category,
    tags: row.tags,
    publishedAt: row.publishedAt.toISOString(),
    readingTime: row.readingTime,
    published: row.published,
  };
}

export async function mapBlogRowsToApi(rows: BlogPostDbRow[]): Promise<BlogPost[]> {
  const slugByAuthorId = await authorSlugMapFromRows(rows);
  return rows.map((r) => blogRowToApi(r, slugByAuthorId));
}

export async function listPublishedPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return mapBlogRowsToApi(rows);
}

export async function listAllPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
  });
  return mapBlogRowsToApi(rows);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  return row ? (await mapBlogRowsToApi([row]))[0] ?? null : null;
}

export async function upsertBlogPost(
  data: Partial<BlogPost> & { title: string; authorId?: string | null }
): Promise<BlogPost> {
  const slug = slugify(data.slug || data.title) || "yazi";
  let authorName = (data.author ?? "Süpervizyon").trim();
  let authorId: string | null = data.authorId ?? null;

  if (authorId) {
    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (author) authorName = author.fullName;
  }

  const payload = {
    title: data.title.trim(),
    slug,
    excerpt: (data.excerpt ?? "").trim(),
    content: (data.content ?? "").trim(),
    cover: (data.cover ?? "/images/blog-default.jpg").trim(),
    author: authorName,
    authorId,
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
    return (await mapBlogRowsToApi([row]))[0]!;
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  const row = await prisma.blogPost.create({
    data: { ...payload, slug: finalSlug },
  });
  return (await mapBlogRowsToApi([row]))[0]!;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const result = await prisma.blogPost.deleteMany({ where: { id } });
  return result.count > 0;
}
