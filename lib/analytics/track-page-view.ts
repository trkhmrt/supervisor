import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/analytics/user-agent";

export type TrackPageViewInput = {
  path: string;
  referrer?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  sessionId: string;
  userId?: number | null;
};

function normalizePath(path: string): string | null {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.length > 500) return null;
  return trimmed;
}

function normalizeReferrer(referrer: string | null | undefined): string | null {
  if (!referrer?.trim()) return null;
  const value = referrer.trim();
  if (value.length > 500) return value.slice(0, 500);
  return value;
}

export async function trackPageView(input: TrackPageViewInput): Promise<boolean> {
  const path = normalizePath(input.path);
  if (!path) return false;

  const parsed = parseUserAgent(input.userAgent);

  await prisma.pageView.create({
    data: {
      path,
      referrer: normalizeReferrer(input.referrer),
      ipAddress: input.ipAddress?.slice(0, 45) ?? null,
      userAgent: input.userAgent?.slice(0, 500) ?? null,
      browser: parsed.browser,
      os: parsed.os,
      deviceType: parsed.deviceType,
      screenWidth:
        typeof input.screenWidth === "number" && input.screenWidth > 0
          ? Math.min(input.screenWidth, 10000)
          : null,
      screenHeight:
        typeof input.screenHeight === "number" && input.screenHeight > 0
          ? Math.min(input.screenHeight, 10000)
          : null,
      sessionId: input.sessionId.slice(0, 64),
      userId: input.userId ?? null,
    },
  });

  return true;
}
