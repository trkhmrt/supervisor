"use client";

import { AdminSiteAnalyticsPage } from "@/components/admin/AdminSiteAnalyticsPage";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function SiteAnalyticsPage() {
  const user = useSessionUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return <AdminSiteAnalyticsPage />;
}
