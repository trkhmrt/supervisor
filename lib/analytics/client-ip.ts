import type { NextRequest } from "next/server";

/** İstekten ziyaretçi IP adresini çıkarır (proxy/Vercel uyumlu). */
export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 45);
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 45);

  return null;
}
