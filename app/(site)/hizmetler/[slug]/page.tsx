import { notFound } from "next/navigation";
import { getActiveServices, getServiceBySlug, getSupervisors } from "@/lib/db/queries";
import { ServiceDetailClient } from "./ServiceDetailClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, services, supervisors] = await Promise.all([
    getServiceBySlug(slug),
    getActiveServices(),
    getSupervisors(),
  ]);

  if (!service) notFound();

  return (
    <ServiceDetailClient
      service={service}
      featuredSupervisor={supervisors[0] ?? null}
      services={services}
    />
  );
}
