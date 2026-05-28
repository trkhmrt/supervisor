import { prisma } from "@/lib/prisma";
import { mapBlogRowsToApi } from "@/lib/db/blog";
import type { Author, BlogPost } from "@/lib/types";

function authorRowToApi(row: {
  id: string;
  slug: string;
  fullName: string;
  title: string | null;
  bio: string;
  photo: string;
  supervisorId: string | null;
  createdAt: Date;
}): Author {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.fullName,
    title: row.title ?? undefined,
    bio: row.bio,
    photo: row.photo,
    supervisorId: row.supervisorId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAuthors(): Promise<Author[]> {
  const rows = await prisma.author.findMany({ orderBy: { fullName: "asc" } });
  return rows.map(authorRowToApi);
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const row = await prisma.author.findUnique({ where: { slug } });
  return row ? authorRowToApi(row) : null;
}

export async function listPostsByAuthorSlug(slug: string): Promise<BlogPost[]> {
  const author = await prisma.author.findUnique({ where: { slug } });
  if (!author) return [];

  const rows = await prisma.blogPost.findMany({
    where: { authorId: author.id, published: true },
    orderBy: { publishedAt: "desc" },
  });
  return mapBlogRowsToApi(rows);
}

export async function getAuthorWithPosts(slug: string): Promise<{
  author: Author;
  posts: BlogPost[];
} | null> {
  const author = await getAuthorBySlug(slug);
  if (!author) return null;
  const posts = await listPostsByAuthorSlug(slug);
  return { author, posts };
}
