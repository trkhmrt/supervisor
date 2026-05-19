"use client";

import { useParams } from "next/navigation";
import { SupervisorAdminDetailView } from "@/components/admin/SupervisorAdminDetailView";

export default function AdminPanelSupervisorDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return <p className="text-sm text-clinical-muted">Geçersiz süpervizör bağlantısı.</p>;
  }

  return (
    <SupervisorAdminDetailView
      id={id}
      listHref="/dashboard/supervizorler"
      coursesHref="/dashboard/kurslar"
    />
  );
}
