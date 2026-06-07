"use client";

import { useParams } from "next/navigation";
import { ServiceEditView } from "@/components/admin/ServiceEditView";

export default function ServiceEditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return <p className="text-sm text-clinical-muted">Geçersiz hizmet bağlantısı.</p>;
  }

  return <ServiceEditView serviceId={id} />;
}
