import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  APPOINTMENT_STATUS_SEED,
  ROLE_SEED,
} from "@/lib/lookups/seed-data";
import type { AppointmentStatus, UserRole } from "@/lib/types";

type Db = Pick<PrismaClient, "role" | "appointmentStatusLookup">;

export async function seedRoleAndStatusLookups(client: Db = prisma): Promise<void> {
  for (const role of ROLE_SEED) {
    await client.role.upsert({
      where: { key: role.key },
      create: {
        key: role.key,
        label: role.label,
        description: role.description,
        sortOrder: role.sortOrder,
        active: true,
      },
      update: {
        label: role.label,
        description: role.description,
        sortOrder: role.sortOrder,
        active: true,
      },
    });
  }

  for (const status of APPOINTMENT_STATUS_SEED) {
    await client.appointmentStatusLookup.upsert({
      where: { key: status.key },
      create: {
        key: status.key,
        label: status.label,
        description: status.description,
        colorClass: status.colorClass,
        sortOrder: status.sortOrder,
        visibleToSupervisor: status.visibleToSupervisor,
        active: true,
      },
      update: {
        label: status.label,
        description: status.description,
        colorClass: status.colorClass,
        sortOrder: status.sortOrder,
        visibleToSupervisor: status.visibleToSupervisor,
        active: true,
      },
    });
  }
}

export function roleConnect(key: UserRole) {
  return { connect: { key } };
}

let roleIdByKey: Map<string, number> | null = null;
let statusIdByKey: Map<string, number> | null = null;

export async function ensureLookupIdCaches(): Promise<void> {
  if (!roleIdByKey || !statusIdByKey) {
    const [roles, statuses] = await Promise.all([
      prisma.role.findMany({ select: { id: true, key: true } }),
      prisma.appointmentStatusLookup.findMany({ select: { id: true, key: true } }),
    ]);
    roleIdByKey = new Map(roles.map((r) => [r.key, r.id]));
    statusIdByKey = new Map(statuses.map((s) => [s.key, s.id]));
  }
}

export async function roleIdForKey(key: UserRole): Promise<number> {
  await ensureLookupIdCaches();
  const id = roleIdByKey!.get(key);
  if (!id) throw new Error(`Bilinmeyen rol: ${key}`);
  return id;
}

export async function appointmentStatusIdForKey(key: AppointmentStatus): Promise<number> {
  await ensureLookupIdCaches();
  const id = statusIdByKey!.get(key);
  if (!id) throw new Error(`Bilinmeyen randevu statüsü: ${key}`);
  return id;
}

export type StatusRelation = { key: string; label?: string; colorClass?: string };

export function appointmentStatusKey(
  status: AppointmentStatus | StatusRelation | string
): AppointmentStatus {
  if (typeof status === "object" && status !== null && "key" in status) {
    return status.key as AppointmentStatus;
  }
  return status as AppointmentStatus;
}

export function roleKeyFromRow(role: UserRole | { key: string }): UserRole {
  if (typeof role === "object" && role !== null && "key" in role) {
    return role.key as UserRole;
  }
  return role as UserRole;
}
