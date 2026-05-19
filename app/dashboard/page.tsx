"use client";

import { useSessionUser } from "@/hooks/useSessionUser";
import { AdminOverviewPage } from "./AdminOverviewPage";
import { UserOverviewPage } from "./UserOverviewPage";

export default function DashboardPage() {
  const user = useSessionUser();
  if (!user) return null;
  if (user.role === "admin") {
    return <AdminOverviewPage />;
  }
  return <UserOverviewPage />;
}
