/** @deprecated `lib/dashboard/navigation` kullanın */
import type { SessionUser } from "@/lib/types";
import {
  canAccessDashboardRoute as canAccessAdminPanelRoute,
  getDashboardNavForUser as getAdminNavForUser,
  resolveDashboardAccess as resolveAdminPanelAccess,
  type DashboardNavItem,
  type DashboardNavId as AdminNavId,
} from "@/lib/dashboard/navigation";

export {
  canAccessAdminPanelRoute,
  getAdminNavForUser,
  resolveAdminPanelAccess,
  type DashboardNavItem,
  type AdminNavId,
};

export type AdminPanelAccess =
  | { status: "loading" }
  | { status: "redirect"; href: string }
  | { status: "ready"; user: SessionUser; nav: DashboardNavItem[] };
