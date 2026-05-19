"use client";

import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SupervisorAdminDetailView } from "@/components/admin/SupervisorAdminDetailView";

export default function AdminSupervisorDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return (
      <AdminShell>
        <p className="text-sm text-clinical-muted">Geçersiz süpervizör bağlantısı.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <SupervisorAdminDetailView
        id={id}
        listHref="/admin/supervizorler"
        coursesHref="/admin/kurslar"
      />
    </AdminShell>
  );
}
