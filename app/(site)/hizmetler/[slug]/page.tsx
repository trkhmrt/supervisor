import { notFound } from "next/navigation";
import {
  safeGetActiveServices,
  safeGetServiceBySlug,
  safeGetSupervisors,
} from "@/lib/db/queries";
import { ServiceDetailClient } from "./ServiceDetailClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [{ data: service }, { data: services }, { data: supervisors }] = await Promise.all([
    safeGetServiceBySlug(slug),
    safeGetActiveServices(),
    safeGetSupervisors(),
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
