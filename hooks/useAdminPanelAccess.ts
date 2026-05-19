"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchSessionUser } from "@/lib/auth/client";
import {
  canAccessAdminPanelRoute,
  resolveAdminPanelAccess,
  type DashboardNavItem,
} from "@/lib/adminpanel/navigation";
import { useAppStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

export function useAdminPanelAccess(skip = false) {
  const authReady = useAppStore((s) => s.authReady);
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const router = useRouter();
  const pathname = usePathname();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (skip || !authReady) return;
    let cancelled = false;
    void fetchSessionUser().then((fresh) => {
      if (cancelled) return;
      if (fresh) setAuthUser(fresh);
      setAdminUser(fresh);
      setSessionChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authReady, setAuthUser, skip]);

  const access = useMemo(() => {
    if (skip) return { status: "ready" as const, user: adminUser!, nav: [] as DashboardNavItem[] };
    if (!authReady || !sessionChecked) return { status: "loading" as const };
    return resolveAdminPanelAccess(adminUser);
  }, [authReady, sessionChecked, adminUser, skip]);

  useEffect(() => {
    if (skip || access.status !== "redirect") return;
    router.replace(access.href);
  }, [access, router, skip]);

  useEffect(() => {
    if (skip || access.status !== "ready") return;
    if (!canAccessAdminPanelRoute(pathname, access.nav)) {
      router.replace("/adminpanel");
    }
  }, [access, pathname, router, skip]);

  const navItems: DashboardNavItem[] =
    access.status === "ready" ? access.nav : [];
  const user = access.status === "ready" ? access.user : null;
  const shellReady = access.status === "ready";
  const navLoading = !shellReady;

  return { navItems, user, shellReady, navLoading, access };
}
