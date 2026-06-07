"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const DEDUPE_MS = 1500;

export function SiteAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const now = Date.now();
    const prev = lastTracked.current;

    if (prev && prev.key === path && now - prev.at < DEDUPE_MS) {
      return;
    }
    lastTracked.current = { key: path, at: now };

    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        path,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        screenWidth: typeof window !== "undefined" ? window.screen.width : null,
        screenHeight: typeof window !== "undefined" ? window.screen.height : null,
      }),
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
