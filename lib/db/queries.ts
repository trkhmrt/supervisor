import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { serviceRowToApi } from "@/lib/db/service-mapper";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import type { BlogPost, Review, Service, Supervisor } from "@/lib/types";

/** Aktif hizmetler — Server Component / SSR (React cache ile istek başına tek sorgu). */
export const getActiveServices = cache(async (): Promise<Service[]> => {
  const rows = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return rows.map(serviceRowToApi);
});

/** Tüm süpervizörler — SSR listeleri. */
export const getSupervisors = cache(async (): Promise<Supervisor[]> => {
  const rows = await prisma.supervisor.findMany({
    include: { slots: true, services: true },
    orderBy: { fullName: "asc" },
  });
  return rows.map(supervisorRowToApi);
});

export const getSupervisorById = cache(async (id: string): Promise<Supervisor | null> => {
  const row = await prisma.supervisor.findUnique({
    where: { id },
    include: { slots: true, services: true },
  });
  return row ? supervisorRowToApi(row) : null;
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const row = await prisma.service.findFirst({
    where: { slug, active: true },
  });
  return row ? serviceRowToApi(row) : null;
});

export async function safeGetActiveServices(): Promise<{
  data: Service[];
  error: string | null;
}> {
  try {
    return { data: await getActiveServices(), error: null };
  } catch (e) {
    return { data: [], error: prismaUnavailableMessage(e) };
  }
}

export async function safeGetSupervisors(): Promise<{
  data: Supervisor[];
  error: string | null;
}> {
  try {
    return { data: await getSupervisors(), error: null };
  } catch (e) {
    return { data: [], error: prismaUnavailableMessage(e) };
  }
}

export async function safeGetSupervisorById(id: string): Promise<{
  data: Supervisor | null;
  error: string | null;
}> {
  try {
    return { data: await getSupervisorById(id), error: null };
  } catch (e) {
    return { data: null, error: prismaUnavailableMessage(e) };
  }
}

export async function safeGetServiceBySlug(slug: string): Promise<{
  data: Service | null;
  error: string | null;
}> {
  try {
    return { data: await getServiceBySlug(slug), error: null };
  } catch (e) {
    return { data: null, error: prismaUnavailableMessage(e) };
  }
}

export const getPublishedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    cover: r.cover,
    author: r.author,
    category: r.category,
    tags: r.tags,
    publishedAt: r.publishedAt.toISOString(),
    readingTime: r.readingTime,
    published: r.published,
  }));
});

export const getReviewsForSupervisor = cache(async (supervisorId: string): Promise<Review[]> => {
  const rows = await prisma.review.findMany({
    where: { supervisorId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    supervisorId: r.supervisorId,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));
});

export async function safeGetPublishedBlogPosts(): Promise<{
  data: BlogPost[];
  error: string | null;
}> {
  try {
    return { data: await getPublishedBlogPosts(), error: null };
  } catch (e) {
    return { data: [], error: prismaUnavailableMessage(e) };
  }
}
