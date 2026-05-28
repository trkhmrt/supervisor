import { sessionToParts } from "@/lib/datetime";
import { serviceRowToApi } from "@/lib/db/service-mapper";
import type { Supervisor } from "@/lib/types";
import type {
  AvailabilitySlot as PrismaSlot,
  Service as PrismaService,
  Supervisor as PrismaSupervisor,
} from "@prisma/client";

export type SupervisorWithSlots = PrismaSupervisor & {
  slots: PrismaSlot[];
  services?: PrismaService[];
};

export function supervisorRowToApi(row: SupervisorWithSlots): Supervisor {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    fullName: row.fullName,
    title: row.title,
    photo: row.photo,
    bio: row.bio,
    pricePerSession: row.pricePerSession,
    sessionFeeOnRequest: row.sessionFeeOnRequest,
    currency: row.currency as Supervisor["currency"],
    rating: row.rating,
    reviewCount: row.reviewCount,
    yearsExperience: row.yearsExperience,
    license: row.license,
    languages: row.languages,
    approaches: row.approaches,
    expertise: row.expertise,
    services: row.services ? row.services.map(serviceRowToApi) : [],
    availability: row.slots.map((slot) => ({
      id: slot.id,
      supervisorId: slot.supervisorId,
      ...sessionToParts(slot.startsAt, slot.endsAt),
      isBooked: slot.isBooked,
    })),
  };
}
