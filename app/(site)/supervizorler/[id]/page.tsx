import { notFound } from "next/navigation";
import {
  getReviewsForSupervisor,
  safeGetActiveServices,
  safeGetSupervisorById,
  safeGetSupervisors,
} from "@/lib/db/queries";
import { SupervisorProfileClient } from "./SupervisorProfileClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorProfilePage({ params }: Props) {
  const { id } = await params;
  const [{ data: supervisor }, { data: services }, { data: supervisors }, reviews] =
    await Promise.all([
      safeGetSupervisorById(id),
      safeGetActiveServices(),
      safeGetSupervisors(),
      getReviewsForSupervisor(id).catch(() => []),
    ]);

  if (!supervisor) notFound();

  const bookingService =
    services.find((s) => s.slug === "bireysel-supervizyon") ?? services[0] ?? null;

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
