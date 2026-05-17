import { notFound } from "next/navigation";
import { ensureDefaultAvailabilitySlots } from "@/lib/db/availability";
import { safeGetActiveServices, safeGetSupervisorById } from "@/lib/db/queries";
import { AppointmentBookingClient } from "./AppointmentBookingClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorAppointmentPage({ params }: Props) {
  const { id } = await params;

  try {
    await ensureDefaultAvailabilitySlots(id);
  } catch (e) {
    console.error("[randevu] Müsaitlik slotları oluşturulamadı:", e);
  }

  const [{ data: supervisor }, { data: services }] = await Promise.all([
    safeGetSupervisorById(id),
    safeGetActiveServices(),
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
