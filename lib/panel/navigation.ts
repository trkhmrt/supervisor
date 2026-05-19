/** @deprecated `lib/dashboard/navigation` kullanın */
export {
  canAccessDashboardRoute as canAccessPanelRoute,
  DASHBOARD_BASE,
  DASHBOARD_NAV_USER,
  DASHBOARD_NAV_SUPERVISOR,
  getDashboardNavForUser as getPanelNavForUser,
  resolveDashboardAccess as resolvePanelAccess,
  type DashboardNavItem as PanelNavItem,
  type DashboardNavId as PanelNavId,
} from "@/lib/dashboard/navigation";
