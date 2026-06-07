import { notFound } from "next/navigation";
import {
  getReviewsForSupervisor,
  safeGetActiveServices,
  safeGetSupervisorById,
  safeGetSupervisors,
} from "@/lib/db/queries";
import { pickBookingServiceForSupervisor } from "@/lib/services/supervisor-filter";
import { SupervisorProfileClient } from "./SupervisorProfileClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hizmet?: string }>;
};

export default async function SupervisorProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { hizmet } = await searchParams;
  const [{ data: supervisor }, { data: services }, { data: supervisors }, reviews] =
    await Promise.all([
      safeGetSupervisorById(id),
      safeGetActiveServices(),
      safeGetSupervisors(),
      getReviewsForSupervisor(id).catch(() => []),
    ]);

  if (!supervisor) notFound();

  const bookingService = pickBookingServiceForSupervisor(
    hizmet,
    services,
    supervisor.services
  );

  return (
    <SupervisorProfileClient
      supervisor={supervisor}
      services={services}
      bookingService={bookingService}
      featuredSupervisors={supervisors.slice(0, 3)}
      reviews={reviews}
    />
  );
}
