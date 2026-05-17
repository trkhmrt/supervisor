import { notFound } from "next/navigation";
import { getActiveServices, getSupervisorById, getSupervisors } from "@/lib/db/queries";
import { SupervisorProfileClient } from "./SupervisorProfileClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorProfilePage({ params }: Props) {
  const { id } = await params;
  const [supervisor, services, supervisors] = await Promise.all([
    getSupervisorById(id),
    getActiveServices(),
    getSupervisors(),
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
    />
  );
}
