import type { Service } from "@/lib/types";
import type { Service as PrismaService } from "@prisma/client";

export function serviceRowToApi(row: PrismaService): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    features: row.features,
    icon: row.icon,
    price: row.price,
    duration: row.duration,
    active: row.active,
  };
}
