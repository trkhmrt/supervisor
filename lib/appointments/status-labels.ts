import type { AppointmentStatus } from "@/lib/types";
import { APPOINTMENT_STATUS_SEED } from "@/lib/lookups/seed-data";

export const APPOINTMENT_STATUS_LABELS = Object.fromEntries(
  APPOINTMENT_STATUS_SEED.map((s) => [s.key, s.label])
) as Record<AppointmentStatus, string>;

export const APPOINTMENT_STATUS_COLORS = Object.fromEntries(
  APPOINTMENT_STATUS_SEED.map((s) => [s.key, s.colorClass])
) as Record<AppointmentStatus, string>;

export const SUPERVISOR_VISIBLE_STATUSES: AppointmentStatus[] = APPOINTMENT_STATUS_SEED.filter(
  (s) => s.visibleToSupervisor
).map((s) => s.key);

export { APPOINTMENT_STATUS_SEED, ROLE_SEED } from "@/lib/lookups/seed-data";
