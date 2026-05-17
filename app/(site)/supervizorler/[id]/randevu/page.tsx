import { notFound } from "next/navigation";
import { ensureDefaultAvailabilitySlots } from "@/lib/db/availability";
import { getActiveServices, getSupervisorById } from "@/lib/db/queries";
import { AppointmentBookingClient } from "./AppointmentBookingClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorAppointmentPage({ params }: Props) {
  const { id } = await params;

  await ensureDefaultAvailabilitySlots(id);

  const [supervisor, services] = await Promise.all([
    getSupervisorById(id),
    getActiveServices(),
  ]);

  if (!supervisor) notFound();

  const service =
    services.find((s) => s.slug === "bireysel-supervizyon") ?? services[0] ?? null;

  return (
    <AppointmentBookingClient
      supervisor={supervisor}
      service={service}
    />
  );
}
