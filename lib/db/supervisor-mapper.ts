import type { Supervisor } from "@/lib/types";
import type { AvailabilitySlot as PrismaSlot, Supervisor as PrismaSupervisor } from "@prisma/client";

export type SupervisorWithSlots = PrismaSupervisor & { slots: PrismaSlot[] };

export function supervisorRowToApi(row: SupervisorWithSlots): Supervisor {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    fullName: row.fullName,
    title: row.title,
    photo: row.photo,
    bio: row.bio,
    pricePerSession: row.pricePerSession,
    currency: row.currency as Supervisor["currency"],
    rating: row.rating,
    reviewCount: row.reviewCount,
    yearsExperience: row.yearsExperience,
    license: row.license,
    languages: row.languages,
    approaches: row.approaches,
    expertise: row.expertise,
    availability: row.slots.map((slot) => ({
      id: slot.id,
      supervisorId: slot.supervisorId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: slot.isBooked,
    })),
  };
}
