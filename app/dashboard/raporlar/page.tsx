"use client";

import { AdminReportsPage } from "@/components/admin/AdminReportsPage";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function ReportsPage() {
  const user = useSessionUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return <AdminReportsPage />;
}
