"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchSessionUser } from "@/lib/auth/client";
import {
  canAccessDashboardRoute,
  DASHBOARD_BASE,
  resolveDashboardAccess,
  type DashboardNavItem,
} from "@/lib/dashboard/navigation";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

export function useDashboardAccess() {
  const authReady = useAppStore((s) => s.authReady);
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const storeUser = useCurrentUser() as SessionUser | null;
  const router = useRouter();
  const pathname = usePathname();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    void fetchSessionUser().then((fresh) => {
      if (cancelled) return;
      setSessionChecked(true);
      if (fresh) setAuthUser(fresh);
    });
    return () => {
      cancelled = true;
    };
  }, [authReady, setAuthUser]);

  const access = useMemo(() => {
    if (!authReady || !sessionChecked) return { status: "loading" as const };
    return resolveDashboardAccess(storeUser);
  }, [authReady, sessionChecked, storeUser]);

  useEffect(() => {
    if (access.status !== "redirect") return;
    router.replace(access.href);
  }, [access, router]);

  useEffect(() => {
    if (access.status !== "ready") return;
    if (!canAccessDashboardRoute(pathname, access.nav)) {
      router.replace(DASHBOARD_BASE);
    }
  }, [access, pathname, router]);

  const navItems: DashboardNavItem[] =
    access.status === "ready" ? access.nav : [];
  const user = access.status === "ready" ? access.user : null;
  const shellReady = access.status === "ready";
  const navLoading = !shellReady;

  return { navItems, user, shellReady, navLoading, access };
}
