"use client";

import { useSessionUser } from "@/hooks/useSessionUser";
import { AdminSupervisorsPage } from "./AdminSupervisorsPage";
import { UserSupervisorsPage } from "./UserSupervisorsPage";

export default function SupervizorlerPage() {
  const user = useSessionUser();
  if (user?.role === "admin") {
    return <AdminSupervisorsPage />;
  }
  return <UserSupervisorsPage />;
}
