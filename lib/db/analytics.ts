import { prisma } from "@/lib/prisma";

export type SiteAnalyticsFilters = {
  from?: string;
  to?: string;
  path?: string;
  limit?: number;
  offset?: number;
};

export type SiteAnalyticsTotals = {
  pageViews: number;
  uniqueSessions: number;
  uniqueIps: number;
  botViews: number;
};

export type SiteAnalyticsCountRow = {
  key: string;
  label: string;
  count: number;
};

export type SiteAnalyticsDailyRow = {
  date: string;
  label: string;
  count: number;
};

export type SiteAnalyticsRecentRow = {
  id: string;
  path: string;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  referrer: string | null;
  screenWidth: number | null;
  screenHeight: number | null;
  sessionId: string;
  userEmail: string | null;
  createdAt: string;
};

export type SiteAnalytics = {
  period: { from: string | null; to: string | null };
  totals: SiteAnalyticsTotals;
  topPages: SiteAnalyticsCountRow[];
  topReferrers: SiteAnalyticsCountRow[];
  byDevice: SiteAnalyticsCountRow[];
  byBrowser: SiteAnalyticsCountRow[];
  byOs: SiteAnalyticsCountRow[];
  dailyViews: SiteAnalyticsDailyRow[];
  recentViews: SiteAnalyticsRecentRow[];
  recentTotal: number;
};

function parseDateRange(filters: SiteAnalyticsFilters): {
  from: Date | undefined;
  to: Date | undefined;
} {
  let from: Date | undefined;
  let to: Date | undefined;

  if (filters.from?.trim()) {
    const d = new Date(`${filters.from.trim()}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) from = d;
  }
  if (filters.to?.trim()) {
    const d = new Date(`${filters.to.trim()}T23:59:59.999Z`);
    if (!Number.isNaN(d.getTime())) to = d;
  }

  return { from, to };
}

function buildWhere(filters: SiteAnalyticsFilters) {
  const { from, to } = parseDateRange(filters);
  const pathFilter = filters.path?.trim() || undefined;

  return {
    ...(pathFilter ? { path: { contains: pathFilter } } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
  };
}

const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function referrerLabel(key: string): string {
  try {
    const url = new URL(key);
    return url.hostname + (url.pathname !== "/" ? url.pathname : "");
  } catch {
    return key.length > 60 ? `${key.slice(0, 57)}…` : key;
  }
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobil",
  tablet: "Tablet",
  desktop: "Masaüstü",
  bot: "Bot",
  unknown: "Bilinmiyor",
};

export async function getSiteAnalytics(filters: SiteAnalyticsFilters = {}): Promise<SiteAnalytics> {
  const where = buildWhere(filters);
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.max(filters.offset ?? 0, 0);

  const [
    pageViews,
    uniqueSessions,
    uniqueIps,
    botViews,
    topPagesRaw,
    topReferrersRaw,
    byDeviceRaw,
    byBrowserRaw,
    byOsRaw,
    dateRows,
    recentRows,
    recentTotal,
  ] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.pageView.findMany({ where, distinct: ["sessionId"], select: { sessionId: true } }),
    prisma.pageView.findMany({
      where: { ...where, ipAddress: { not: null } },
      distinct: ["ipAddress"],
      select: { ipAddress: true },
    }),
    prisma.pageView.count({ where: { ...where, deviceType: "bot" } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where,
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 15,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { ...where, referrer: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["deviceType"],
      where,
      _count: { _all: true },
      orderBy: { _count: { deviceType: "desc" } },
    }),
    prisma.pageView.groupBy({
      by: ["browser"],
      where,
      _count: { _all: true },
      orderBy: { _count: { browser: "desc" } },
      take: 8,
    }),
    prisma.pageView.groupBy({
      by: ["os"],
      where,
      _count: { _all: true },
      orderBy: { _count: { os: "desc" } },
      take: 8,
    }),
    prisma.pageView.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pageView.findMany({
      where,
      select: {
        id: true,
        path: true,
        referrer: true,
        ipAddress: true,
        browser: true,
        os: true,
        deviceType: true,
        screenWidth: true,
        screenHeight: true,
        sessionId: true,
        createdAt: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.pageView.count({ where }),
  ]);

  const dailyMap = new Map<string, SiteAnalyticsDailyRow>();
  for (const row of dateRows) {
    const d = row.createdAt;
    const date = d.toISOString().slice(0, 10);
    const existing = dailyMap.get(date);
    if (existing) {
      existing.count += 1;
    } else {
      dailyMap.set(date, {
        date,
        label: `${d.getUTCDate()} ${DAY_LABELS[d.getUTCDay()]}`,
        count: 1,
      });
    }
  }

  return {
    period: {
      from: filters.from?.trim() || null,
      to: filters.to?.trim() || null,
    },
    totals: {
      pageViews,
      uniqueSessions: uniqueSessions.length,
      uniqueIps: uniqueIps.length,
      botViews,
    },
    topPages: topPagesRaw.map((r) => ({
      key: r.path,
      label: r.path,
      count: r._count._all,
    })),
    topReferrers: topReferrersRaw.map((r) => ({
      key: r.referrer!,
      label: referrerLabel(r.referrer!),
      count: r._count._all,
    })),
    byDevice: byDeviceRaw.map((r) => ({
      key: r.deviceType ?? "unknown",
      label: DEVICE_LABELS[r.deviceType ?? "unknown"] ?? r.deviceType ?? "Bilinmiyor",
      count: r._count._all,
    })),
    byBrowser: byBrowserRaw.map((r) => ({
      key: r.browser ?? "Bilinmiyor",
      label: r.browser ?? "Bilinmiyor",
      count: r._count._all,
    })),
    byOs: byOsRaw.map((r) => ({
      key: r.os ?? "Bilinmiyor",
      label: r.os ?? "Bilinmiyor",
      count: r._count._all,
    })),
    dailyViews: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    recentViews: recentRows.map((v) => ({
      id: v.id,
      path: v.path,
      ipAddress: v.ipAddress,
      browser: v.browser,
      os: v.os,
      deviceType: v.deviceType,
      referrer: v.referrer,
      screenWidth: v.screenWidth,
      screenHeight: v.screenHeight,
      sessionId: v.sessionId,
      userEmail: v.user?.email ?? null,
      createdAt: v.createdAt.toISOString(),
    })),
    recentTotal,
  };
}
