"use client";

import { useParams } from "next/navigation";
import { AdminCourseDetailView } from "@/components/admin/AdminCourseDetailView";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return <p className="text-sm text-clinical-muted">Geçersiz eğitim bağlantısı.</p>;
  }

  return <AdminCourseDetailView courseId={id} />;
}
