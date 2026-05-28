import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ServiceGroup, ServiceGroupWithStats } from "@/lib/types";

const GROUP_SELECT = {
  id: true,
  supervisorId: true,
  serviceId: true,
  name: true,
  capacity: true,
  seatLabel: true,
  sortOrder: true,
  active: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceGroupSelect;

type GroupRow = Prisma.ServiceGroupGetPayload<{ select: typeof GROUP_SELECT }>;

function groupRowToApi(row: GroupRow, enrolledCount: number): ServiceGroupWithStats {
  return {
    id: row.id,
    supervisorId: row.supervisorId,
    serviceId: row.serviceId,
    name: row.name,
    capacity: row.capacity,
    seatLabel: row.seatLabel ?? undefined,
    sortOrder: row.sortOrder,
    active: row.active,
    startsAt: row.startsAt?.toISOString() ?? undefined,
    endsAt: row.endsAt?.toISOString() ?? undefined,
    enrolledCount,
    remainingSeats: Math.max(0, row.capacity - enrolledCount),
    isFull: enrolledCount >= row.capacity,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function countActiveEnrollments(groupIds: string[]): Promise<Map<string, number>> {
  if (!groupIds.length) return new Map();

  const rows = await prisma.serviceGroupEnrollment.groupBy({
    by: ["groupId"],
    where: {
      groupId: { in: groupIds },
      appointment: { status: { not: "cancelled" } },
    },
    _count: { _all: true },
  });

  return new Map(rows.map((r) => [r.groupId, r._count._all]));
}

export async function listServiceGroupsForSupervisorService(
  supervisorId: string,
  serviceId: string,
  options?: { activeOnly?: boolean }
): Promise<ServiceGroupWithStats[]> {
  const where: Prisma.ServiceGroupWhereInput = { supervisorId, serviceId };
  if (options?.activeOnly !== false) where.active = true;

  const rows = await prisma.serviceGroup.findMany({
    where,
    select: GROUP_SELECT,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const counts = await countActiveEnrollments(rows.map((r) => r.id));
  return rows.map((r) => groupRowToApi(r, counts.get(r.id) ?? 0));
}

export async function listServiceGroupsForAdmin(
  supervisorId: string,
  serviceId?: string
): Promise<ServiceGroupWithStats[]> {
  const where: Prisma.ServiceGroupWhereInput = { supervisorId };
  if (serviceId) where.serviceId = serviceId;

  const rows = await prisma.serviceGroup.findMany({
    where,
    select: GROUP_SELECT,
    orderBy: [{ serviceId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const counts = await countActiveEnrollments(rows.map((r) => r.id));
  return rows.map((r) => groupRowToApi(r, counts.get(r.id) ?? 0));
}

export type CreateServiceGroupInput = {
  supervisorId: string;
  serviceId: string;
  name: string;
  capacity: number;
  seatLabel?: string;
  sortOrder?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function createServiceGroup(input: CreateServiceGroupInput): Promise<ServiceGroupWithStats> {
  const service = await prisma.service.findFirst({
    where: {
      id: input.serviceId,
      isGroupService: true,
      supervisors: { some: { id: input.supervisorId } },
    },
  });
  if (!service) {
    throw new Error("Grup hizmeti bulunamadı veya süpervizör bu hizmeti vermiyor.");
  }

  const row = await prisma.serviceGroup.create({
    data: {
      supervisorId: input.supervisorId,
      serviceId: input.serviceId,
      name: input.name.trim(),
      capacity: input.capacity,
      seatLabel: input.seatLabel?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      active: input.active !== false,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
    },
    select: GROUP_SELECT,
  });

  return groupRowToApi(row, 0);
}

export type UpdateServiceGroupInput = {
  name?: string;
  capacity?: number;
  seatLabel?: string | null;
  sortOrder?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function updateServiceGroup(
  id: string,
  input: UpdateServiceGroupInput
): Promise<ServiceGroupWithStats | null> {
  const data: Prisma.ServiceGroupUpdateInput = {};

  if (typeof input.name === "string" && input.name.trim()) data.name = input.name.trim();
  if (typeof input.capacity === "number" && input.capacity > 0) data.capacity = input.capacity;
  if (input.seatLabel !== undefined) data.seatLabel = input.seatLabel?.trim() || null;
  if (typeof input.sortOrder === "number") data.sortOrder = input.sortOrder;
  if (typeof input.active === "boolean") data.active = input.active;
  if (input.startsAt !== undefined) data.startsAt = input.startsAt ? new Date(input.startsAt) : null;
  if (input.endsAt !== undefined) data.endsAt = input.endsAt ? new Date(input.endsAt) : null;

  try {
    const row = await prisma.serviceGroup.update({
      where: { id },
      data,
      select: GROUP_SELECT,
    });
    const counts = await countActiveEnrollments([row.id]);
    return groupRowToApi(row, counts.get(row.id) ?? 0);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
    throw e;
  }
}

export async function deleteServiceGroup(id: string): Promise<boolean> {
  const activeCount = await prisma.serviceGroupEnrollment.count({
    where: {
      groupId: id,
      appointment: { status: { not: "cancelled" } },
    },
  });
  if (activeCount > 0) {
    throw new Error("Aktif kayıtlı üyeleri olan grup silinemez.");
  }

  try {
    await prisma.serviceGroup.delete({ where: { id } });
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return false;
    throw e;
  }
}

export async function getServiceGroupById(id: string): Promise<ServiceGroup | null> {
  const row = await prisma.serviceGroup.findUnique({
    where: { id },
    select: GROUP_SELECT,
  });
  if (!row) return null;
  const counts = await countActiveEnrollments([row.id]);
  return groupRowToApi(row, counts.get(row.id) ?? 0);
}
