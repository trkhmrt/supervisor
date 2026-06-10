import { prisma } from "@/lib/prisma";
import {
  DEFAULT_FOUNDER_PROFILE,
  FOUNDER_AUTHOR_SLUG,
  parseFounderContentInput,
  resolveFounderContent,
  type FounderPageContent,
} from "@/lib/content/founder-profile";
import type { Author } from "@/lib/types";

export type FounderProfileAdmin = {
  author: Author;
  founderContent: FounderPageContent;
  publicPath: string;
};

function mapAuthorRow(row: {
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

export async function getFounderProfileAdmin(): Promise<FounderProfileAdmin | null> {
  const row = await prisma.author.findUnique({ where: { slug: FOUNDER_AUTHOR_SLUG } });
  if (!row) return null;

  return {
    author: mapAuthorRow(row),
    founderContent: resolveFounderContent(row.founderContent),
    publicPath: `/yazar/${row.slug}`,
  };
}

export async function getFounderContentByAuthorSlug(slug: string): Promise<FounderPageContent | null> {
  if (slug !== FOUNDER_AUTHOR_SLUG) return null;
  const row = await prisma.author.findUnique({
    where: { slug },
    select: { founderContent: true },
  });
  if (!row) return null;
  return resolveFounderContent(row.founderContent);
}

export type UpdateFounderProfileInput = {
  fullName?: string;
  title?: string | null;
  bio?: string;
  photo?: string;
  founderContent?: FounderPageContent;
};

export async function updateFounderProfile(
  input: UpdateFounderProfileInput
): Promise<FounderProfileAdmin> {
  const existing = await prisma.author.findUnique({ where: { slug: FOUNDER_AUTHOR_SLUG } });
  if (!existing) {
    throw new Error("Kurucu yazar kaydı bulunamadı.");
  }

  const founderContent = input.founderContent ?? resolveFounderContent(existing.founderContent);

  const row = await prisma.author.update({
    where: { id: existing.id },
    data: {
      ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
      ...(input.title !== undefined ? { title: input.title?.trim() || null } : {}),
      ...(input.bio !== undefined ? { bio: input.bio.trim() } : {}),
      ...(input.photo !== undefined ? { photo: input.photo.trim() } : {}),
      founderContent,
    },
  });

  if (row.supervisorId) {
    await prisma.supervisor.update({
      where: { id: row.supervisorId },
      data: {
        ...(input.fullName !== undefined ? { fullName: input.fullName.trim() } : {}),
        ...(input.bio !== undefined ? { bio: input.bio.trim() } : {}),
        ...(input.photo !== undefined ? { photo: input.photo.trim() } : {}),
        ...(input.title !== undefined
          ? { title: input.title?.trim() || existing.title || "" }
          : {}),
      },
    });
  }

  return {
    author: mapAuthorRow(row),
    founderContent: resolveFounderContent(row.founderContent),
    publicPath: `/yazar/${row.slug}`,
  };
}

export function buildFounderContentFromForm(body: Record<string, unknown>): FounderPageContent | null {
  return parseFounderContentInput(body.founderContent);
}

export function seedFounderContentJson(): FounderPageContent {
  return DEFAULT_FOUNDER_PROFILE;
}
