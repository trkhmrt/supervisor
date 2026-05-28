import { notFound } from "next/navigation";
import { ensureDefaultAvailabilitySlots } from "@/lib/db/availability";
import { safeGetActiveServices, safeGetSupervisorById } from "@/lib/db/queries";
import { AppointmentBookingClient } from "./AppointmentBookingClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ service?: string }>;
};

export default async function SupervisorAppointmentPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { service: serviceParam } = await searchParams;

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

  const supervisorServiceIds = new Set((supervisor.services ?? []).map((s) => s.id));
  const supervisorServiceSlugs = new Set((supervisor.services ?? []).map((s) => s.slug));

  let service =
    services.find((s) => s.id === serviceParam || s.slug === serviceParam) ?? null;

  if (service && supervisorServiceIds.size > 0) {
    if (!supervisorServiceIds.has(service.id) && !supervisorServiceSlugs.has(service.slug)) {
      service = null;
    }
  }

  if (!service) {
    const offered =
      (supervisor.services ?? [])
        .map((ss) => services.find((s) => s.id === ss.id))
        .filter(Boolean) ?? [];
    service =
      offered.find((s) => s!.slug === "bireysel-supervizyon") ??
      offered.find((s) => !s!.isGroupService) ??
      offered[0] ??
      services.find((s) => s.slug === "bireysel-supervizyon") ??
      services[0] ??
      null;
  }

  return <AppointmentBookingClient supervisor={supervisor} service={service} />;
}
