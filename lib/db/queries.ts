import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { serviceRowToApi } from "@/lib/db/service-mapper";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import type { Service, Supervisor } from "@/lib/types";

/** Aktif hizmetler — Server Component / SSR (React cache ile istek başına tek sorgu). */
export const getActiveServices = cache(async (): Promise<Service[]> => {
  const rows = await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return rows.map(serviceRowToApi);
});

/** Tüm süpervizörler — SSR listeleri. */
export const getSupervisors = cache(async (): Promise<Supervisor[]> => {
  const rows = await prisma.supervisor.findMany({
    include: { slots: true },
    orderBy: { fullName: "asc" },
  });
  return rows.map(supervisorRowToApi);
});

export const getSupervisorById = cache(async (id: string): Promise<Supervisor | null> => {
  const row = await prisma.supervisor.findUnique({
    where: { id },
    include: { slots: true },
  });
  return row ? supervisorRowToApi(row) : null;
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const row = await prisma.service.findFirst({
    where: { slug, active: true },
  });
  return row ? serviceRowToApi(row) : null;
});

export async function safeGetActiveServices(): Promise<{
  data: Service[];
  error: string | null;
}> {
  try {
    return { data: await getActiveServices(), error: null };
  } catch (e) {
    return { data: [], error: prismaUnavailableMessage(e) };
  }
}

export async function safeGetSupervisors(): Promise<{
  data: Supervisor[];
  error: string | null;
}> {
  try {
    return { data: await getSupervisors(), error: null };
  } catch (e) {
    return { data: [], error: prismaUnavailableMessage(e) };
  }
}
