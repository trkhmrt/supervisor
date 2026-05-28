import { Prisma } from "@prisma/client";
import type { CourseEnrollmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { AdminCourse, Course, CourseEnrollment } from "@/lib/types";

function courseRowToApi(
  row: {
    id: string;
    supervisorId: string;
    title: string;
    slug: string;
    description: string;
    active: boolean;
    acceptsApplications: boolean;
    maxParticipants: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
    createdAt: Date;
    _count?: { enrollments: number };
    pendingCount?: number;
  }
): Course {
  return {
    id: row.id,
    supervisorId: row.supervisorId,
    title: row.title,
    slug: row.slug,
    description: row.description,
    active: row.active,
    acceptsApplications: row.acceptsApplications,
    maxParticipants: row.maxParticipants,
    startsAt: row.startsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    enrollmentCount: row._count?.enrollments,
    pendingCount: row.pendingCount,
  };
}

function enrollmentRowToApi(
  row: Prisma.CourseEnrollmentGetPayload<{
    include: { user: { select: { id: true; fullName: true; email: true; profession: true } } };
  }>
): CourseEnrollment {
  return {
    id: row.id,
    courseId: row.courseId,
    userId: row.userId,
    status: row.status as CourseEnrollment["status"],
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    user: row.user
      ? {
          id: row.user.id,
          fullName: row.user.fullName,
          email: row.user.email,
          profession: row.user.profession,
        }
      : undefined,
  };
}

export type AdminCourseFilters = {
  q?: string;
  supervisorId?: string;
  active?: boolean;
};

export async function listAllCoursesForAdmin(
  filters: AdminCourseFilters = {}
): Promise<AdminCourse[]> {
  const q = filters.q?.trim().toLowerCase();
  const rows = await prisma.course.findMany({
    where: {
      ...(filters.supervisorId ? { supervisorId: filters.supervisorId } : {}),
      ...(filters.active !== undefined ? { active: filters.active } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      supervisor: { select: { fullName: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const pendingByCourse = await prisma.courseEnrollment.groupBy({
    by: ["courseId"],
    where: {
      courseId: { in: rows.map((r) => r.id) },
      status: "pending",
    },
    _count: { _all: true },
  });
  const pendingMap = new Map(pendingByCourse.map((p) => [p.courseId, p._count._all]));

  let result = rows.map((r) => ({
    ...courseRowToApi({
      ...r,
      pendingCount: pendingMap.get(r.id) ?? 0,
    }),
    supervisorName: r.supervisor.fullName,
  }));

  if (q) {
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.supervisorName.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function listCoursesForSupervisor(supervisorId: string): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { supervisorId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  const pendingByCourse = await prisma.courseEnrollment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: rows.map((r) => r.id) }, status: "pending" },
    _count: { _all: true },
  });
  const pendingMap = new Map(pendingByCourse.map((p) => [p.courseId, p._count._all]));

  return rows.map((r) =>
    courseRowToApi({
      ...r,
      pendingCount: pendingMap.get(r.id) ?? 0,
    })
  );
}

export async function listPublicCoursesForSupervisor(supervisorId: string): Promise<Course[]> {
  const rows = await prisma.course.findMany({
    where: { supervisorId, active: true, acceptsApplications: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return rows.map((r) => courseRowToApi(r));
}

export async function listPublicCourses(): Promise<AdminCourse[]> {
  const rows = await prisma.course.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: {
      supervisor: { select: { fullName: true } },
      _count: { select: { enrollments: true } },
    },
  });
  return rows.map((r) => ({
    ...courseRowToApi(r),
    supervisorName: r.supervisor.fullName,
  }));
}

export async function getPublicCourseBySlug(slug: string): Promise<AdminCourse | null> {
  const row = await prisma.course.findFirst({
    where: { slug, active: true },
    include: {
      supervisor: { select: { fullName: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!row) return null;
  return {
    ...courseRowToApi(row),
    supervisorName: row.supervisor.fullName,
  };
}

export async function createCourseByAdmin(
  supervisorId: string,
  input: CreateCourseInput
): Promise<Course> {
  return createCourseForSupervisor(supervisorId, input);
}

export async function updateCourseByAdmin(
  courseId: string,
  data: Partial<CreateCourseInput> & { active?: boolean; acceptsApplications?: boolean }
): Promise<Course | null> {
  const existing = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existing) return null;
  return updateCourseForSupervisor(existing.supervisorId, courseId, data);
}

export async function deleteCourseByAdmin(courseId: string): Promise<boolean> {
  const result = await prisma.course.deleteMany({ where: { id: courseId } });
  return result.count > 0;
}

export type CreateCourseInput = {
  title: string;
  slug?: string;
  description: string;
  active?: boolean;
  acceptsApplications?: boolean;
  maxParticipants?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export async function createCourseForSupervisor(
  supervisorId: string,
  input: CreateCourseInput
): Promise<Course> {
  const title = input.title.trim();
  const slug = slugify(input.slug?.trim() || title) || "kurs";
  const existing = await prisma.course.findUnique({
    where: { supervisorId_slug: { supervisorId, slug } },
  });
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

  const row = await prisma.course.create({
    data: {
      supervisorId,
      title,
      slug: finalSlug,
      description: input.description.trim(),
      active: input.active ?? true,
      acceptsApplications: input.acceptsApplications ?? true,
      maxParticipants: input.maxParticipants ?? null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
    },
    include: { _count: { select: { enrollments: true } } },
  });
  return courseRowToApi(row);
}

export async function updateCourseForSupervisor(
  supervisorId: string,
  courseId: string,
  data: Partial<CreateCourseInput> & { active?: boolean; acceptsApplications?: boolean }
): Promise<Course | null> {
  const existing = await prisma.course.findFirst({
    where: { id: courseId, supervisorId },
  });
  if (!existing) return null;

  const row = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(data.title != null ? { title: data.title.trim() } : {}),
      ...(data.description != null ? { description: data.description.trim() } : {}),
      ...(data.active != null ? { active: data.active } : {}),
      ...(data.acceptsApplications != null
        ? { acceptsApplications: data.acceptsApplications }
        : {}),
      ...(data.maxParticipants !== undefined ? { maxParticipants: data.maxParticipants } : {}),
      ...(data.startsAt !== undefined
        ? { startsAt: data.startsAt ? new Date(data.startsAt) : null }
        : {}),
      ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
    },
    include: { _count: { select: { enrollments: true } } },
  });
  return courseRowToApi(row);
}

export async function deleteCourseForSupervisor(
  supervisorId: string,
  courseId: string
): Promise<boolean> {
  const result = await prisma.course.deleteMany({
    where: { id: courseId, supervisorId },
  });
  return result.count > 0;
}

export async function applyToCourse(
  courseId: string,
  userId: number,
  message?: string
): Promise<{ ok: true; enrollment: CourseEnrollment } | { ok: false; error: string }> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { _count: { select: { enrollments: true } } },
  });

  if (!course || !course.active || !course.acceptsApplications) {
    return { ok: false, error: "Bu kursa başvuru alınmıyor." };
  }

  if (course.supervisorId) {
    const sup = await prisma.supervisor.findUnique({
      where: { id: course.supervisorId },
      select: { userId: true },
    });
    if (sup?.userId === userId) {
      return { ok: false, error: "Kendi kursunuza başvuramazsınız." };
    }
  }

  if (course.maxParticipants != null && course._count.enrollments >= course.maxParticipants) {
    return { ok: false, error: "Kurs kontenjanı dolu." };
  }

  const existing = await prisma.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
  });
  if (existing) {
    return { ok: false, error: "Bu kursa zaten başvurdunuz." };
  }

  const row = await prisma.courseEnrollment.create({
    data: {
      courseId,
      userId,
      message: message?.trim() || null,
      status: "pending",
    },
    include: {
      user: { select: { id: true, fullName: true, email: true, profession: true } },
    },
  });

  return { ok: true, enrollment: enrollmentRowToApi(row) };
}

export async function listEnrollmentsForCourse(
  supervisorId: string,
  courseId: string
): Promise<CourseEnrollment[] | null> {
  const course = await prisma.course.findFirst({
    where: { id: courseId, supervisorId },
  });
  if (!course) return null;

  const rows = await prisma.courseEnrollment.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, email: true, profession: true } },
    },
  });
  return rows.map(enrollmentRowToApi);
}

export async function updateEnrollmentStatus(
  supervisorId: string,
  courseId: string,
  enrollmentId: string,
  status: CourseEnrollmentStatus
): Promise<CourseEnrollment | null> {
  const course = await prisma.course.findFirst({
    where: { id: courseId, supervisorId },
  });
  if (!course) return null;

  const existing = await prisma.courseEnrollment.findFirst({
    where: { id: enrollmentId, courseId },
  });
  if (!existing) return null;

  const row = await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { status },
    include: {
      user: { select: { id: true, fullName: true, email: true, profession: true } },
    },
  });
  return enrollmentRowToApi(row);
}

export async function listEnrollmentsForUser(userId: number): Promise<CourseEnrollment[]> {
  const rows = await prisma.courseEnrollment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, email: true, profession: true } },
      course: { select: { id: true, title: true, slug: true, supervisorId: true } },
    },
  });
  return rows.map((row) => ({
    ...enrollmentRowToApi(row),
    course: row.course
      ? {
          id: row.course.id,
          title: row.course.title,
          slug: row.course.slug,
          supervisorId: row.course.supervisorId,
        }
      : undefined,
  }));
}
