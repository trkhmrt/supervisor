import { prisma } from "@/lib/prisma";
import type { AdDisplayMode, Advertisement } from "@/lib/types";

type PrismaAd = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string;
  linkUrl: string | null;
  displayMode: AdDisplayMode;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function rowToApi(row: PrismaAd): Advertisement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageUrl,
    linkUrl: row.linkUrl,
    displayMode: row.displayMode,
    active: row.active,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    endsAt: row.endsAt ? row.endsAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAds(): Promise<Advertisement[]> {
  const rows = await prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(rowToApi);
}

export async function getActiveAd(): Promise<Advertisement | null> {
  const now = new Date();
  const row = await prisma.advertisement.findFirst({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return row ? rowToApi(row) : null;
}

export type CreateAdInput = {
  title: string;
  body?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  displayMode?: AdDisplayMode;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

export async function createAd(input: CreateAdInput): Promise<Advertisement> {
  const row = await prisma.advertisement.create({
    data: {
      title: input.title.trim(),
      body: input.body?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      linkUrl: input.linkUrl?.trim() || null,
      displayMode: input.displayMode ?? "IMAGE_WITH_TEXT",
      active: input.active ?? true,
      startsAt: parseDate(input.startsAt),
      endsAt: parseDate(input.endsAt),
    },
  });
  return rowToApi(row);
}

export type UpdateAdInput = Partial<CreateAdInput>;

export async function updateAd(id: string, input: UpdateAdInput): Promise<Advertisement> {
  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title.trim();
  if (input.body !== undefined) data.body = input.body?.trim() || null;
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl.trim();
  if (input.linkUrl !== undefined) data.linkUrl = input.linkUrl?.trim() || null;
  if (input.displayMode !== undefined) data.displayMode = input.displayMode;
  if (input.active !== undefined) data.active = input.active;
  if (input.startsAt !== undefined) data.startsAt = parseDate(input.startsAt);
  if (input.endsAt !== undefined) data.endsAt = parseDate(input.endsAt);

  const row = await prisma.advertisement.update({ where: { id }, data });
  return rowToApi(row);
}

export async function deleteAd(id: string): Promise<void> {
  await prisma.advertisement.delete({ where: { id } });
}
