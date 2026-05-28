import { prisma } from "@/lib/prisma";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import type { SupervisorAdminDetail } from "@/lib/types";

export async function getSupervisorAdminDetail(id: string): Promise<SupervisorAdminDetail | null> {
  const row = await prisma.supervisor.findUnique({
    where: { id },
    include: {
      slots: true,
      services: true,
      user: { select: { email: true, emailVerified: true } },
      courses: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { enrollments: true } } },
      },
      _count: { select: { appointments: true } },
    },
  });

  if (!row) return null;

  const supervisor = supervisorRowToApi(row);

  return {
    ...supervisor,
    accountEmail: row.user?.email ?? null,
    emailVerified: row.user?.emailVerified ?? false,
    appointmentCount: row._count.appointments,
    courses: row.courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      active: c.active,
      acceptsApplications: c.acceptsApplications,
      enrollmentCount: c._count.enrollments,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
