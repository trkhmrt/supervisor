import { prisma } from "@/lib/prisma";

export type AdminReportFilters = {
  from?: string;
  to?: string;
  supervisorId?: string;
};

export type AdminReportTotals = {
  collectedRevenue: number;
  pendingRevenue: number;
  appointmentCount: number;
  paidAppointmentCount: number;
  pendingPaymentCount: number;
  completedCount: number;
  cancelledCount: number;
  courseEnrollmentApproved: number;
  courseEnrollmentPending: number;
  courseEnrollmentTotal: number;
  newMemberCount: number;
};

export type AdminSupervisorReportRow = {
  supervisorId: string;
  supervisorName: string;
  collectedRevenue: number;
  pendingRevenue: number;
  appointmentCount: number;
  paidAppointmentCount: number;
  completedCount: number;
  courseCount: number;
  enrollmentApproved: number;
  enrollmentPending: number;
};

export type AdminCourseReportRow = {
  courseId: string;
  courseTitle: string;
  supervisorId: string;
  supervisorName: string;
  enrollmentApproved: number;
  enrollmentPending: number;
  enrollmentRejected: number;
  enrollmentTotal: number;
  active: boolean;
};

export type AdminServiceReportRow = {
  serviceId: string;
  serviceName: string;
  collectedRevenue: number;
  pendingRevenue: number;
  appointmentCount: number;
};

export type AdminMonthlyRevenueRow = {
  month: string;
  label: string;
  revenue: number;
  appointmentCount: number;
};

export type AdminReport = {
  period: { from: string | null; to: string | null };
  totals: AdminReportTotals;
  bySupervisor: AdminSupervisorReportRow[];
  byCourse: AdminCourseReportRow[];
  byService: AdminServiceReportRow[];
  monthlyRevenue: AdminMonthlyRevenueRow[];
};

function parseDateRange(filters: AdminReportFilters): {
  from: Date | undefined;
  to: Date | undefined;
} {
  let from: Date | undefined;
  let to: Date | undefined;

  if (filters.from?.trim()) {
    const d = new Date(`${filters.from.trim()}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) from = d;
  }
  if (filters.to?.trim()) {
    const d = new Date(`${filters.to.trim()}T23:59:59.999Z`);
    if (!Number.isNaN(d.getTime())) to = d;
  }

  return { from, to };
}

function inRange(date: Date, from?: Date, to?: Date): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

const MONTH_LABELS = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

export async function getAdminReport(filters: AdminReportFilters = {}): Promise<AdminReport> {
  const { from, to } = parseDateRange(filters);
  const supervisorFilter = filters.supervisorId?.trim() || undefined;

  const [appointments, enrollments, courses, services, users, supervisors] = await Promise.all([
    prisma.appointment.findMany({
      where: supervisorFilter ? { supervisorId: supervisorFilter } : undefined,
      select: {
        id: true,
        supervisorId: true,
        supervisorName: true,
        serviceType: true,
        amount: true,
        paymentApproved: true,
        createdAt: true,
        status: { select: { key: true } },
      },
    }),
    prisma.courseEnrollment.findMany({
      where: supervisorFilter
        ? { course: { supervisorId: supervisorFilter } }
        : undefined,
      select: {
        status: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true,
            active: true,
            supervisorId: true,
            supervisor: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.course.findMany({
      where: supervisorFilter ? { supervisorId: supervisorFilter } : undefined,
      select: {
        id: true,
        title: true,
        active: true,
        supervisorId: true,
        supervisor: { select: { fullName: true } },
      },
    }),
    prisma.service.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({
      select: { id: true, createdAt: true, role: { select: { key: true } } },
    }),
    prisma.supervisor.findMany({
      where: supervisorFilter ? { id: supervisorFilter } : undefined,
      select: { id: true, fullName: true },
    }),
  ]);

  const serviceNameById = new Map(services.map((s) => [s.id, s.name]));

  const filteredAppointments = appointments.filter((a) => inRange(a.createdAt, from, to));
  const filteredEnrollments = enrollments.filter((e) => inRange(e.createdAt, from, to));
  const filteredUsers = users.filter(
    (u) => u.role.key === "user" && inRange(u.createdAt, from, to)
  );

  const isCollected = (a: (typeof appointments)[0]) =>
    a.paymentApproved && a.amount > 0 && a.status.key !== "cancelled";

  const isPending = (a: (typeof appointments)[0]) =>
    a.status.key === "pending_payment" && a.amount > 0;

  const totals: AdminReportTotals = {
    collectedRevenue: 0,
    pendingRevenue: 0,
    appointmentCount: filteredAppointments.length,
    paidAppointmentCount: 0,
    pendingPaymentCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    courseEnrollmentApproved: 0,
    courseEnrollmentPending: 0,
    courseEnrollmentTotal: filteredEnrollments.length,
    newMemberCount: filteredUsers.length,
  };

  const supervisorMap = new Map<string, AdminSupervisorReportRow>();
  for (const s of supervisors) {
    supervisorMap.set(s.id, {
      supervisorId: s.id,
      supervisorName: s.fullName,
      collectedRevenue: 0,
      pendingRevenue: 0,
      appointmentCount: 0,
      paidAppointmentCount: 0,
      completedCount: 0,
      courseCount: 0,
      enrollmentApproved: 0,
      enrollmentPending: 0,
    });
  }

  for (const c of courses) {
    const row = supervisorMap.get(c.supervisorId);
    if (row) row.courseCount += 1;
  }

  const serviceMap = new Map<string, AdminServiceReportRow>();

  for (const a of filteredAppointments) {
    if (isCollected(a)) {
      totals.collectedRevenue += a.amount;
      totals.paidAppointmentCount += 1;
    }
    if (isPending(a)) {
      totals.pendingRevenue += a.amount;
      totals.pendingPaymentCount += 1;
    }
    if (a.status.key === "completed") totals.completedCount += 1;
    if (a.status.key === "cancelled") totals.cancelledCount += 1;

    let supRow = supervisorMap.get(a.supervisorId);
    if (!supRow) {
      supRow = {
        supervisorId: a.supervisorId,
        supervisorName: a.supervisorName,
        collectedRevenue: 0,
        pendingRevenue: 0,
        appointmentCount: 0,
        paidAppointmentCount: 0,
        completedCount: 0,
        courseCount: 0,
        enrollmentApproved: 0,
        enrollmentPending: 0,
      };
      supervisorMap.set(a.supervisorId, supRow);
    }
    supRow.appointmentCount += 1;
    if (isCollected(a)) {
      supRow.collectedRevenue += a.amount;
      supRow.paidAppointmentCount += 1;
    }
    if (isPending(a)) {
      supRow.pendingRevenue += a.amount;
    }
    if (a.status.key === "completed") supRow.completedCount += 1;

    const svcKey = a.serviceType;
    let svcRow = serviceMap.get(svcKey);
    if (!svcRow) {
      svcRow = {
        serviceId: svcKey,
        serviceName: serviceNameById.get(svcKey) ?? svcKey,
        collectedRevenue: 0,
        pendingRevenue: 0,
        appointmentCount: 0,
      };
      serviceMap.set(svcKey, svcRow);
    }
    svcRow.appointmentCount += 1;
    if (isCollected(a)) svcRow.collectedRevenue += a.amount;
    if (isPending(a)) svcRow.pendingRevenue += a.amount;
  }

  const courseMap = new Map<string, AdminCourseReportRow>();
  for (const c of courses) {
    courseMap.set(c.id, {
      courseId: c.id,
      courseTitle: c.title,
      supervisorId: c.supervisorId,
      supervisorName: c.supervisor.fullName,
      enrollmentApproved: 0,
      enrollmentPending: 0,
      enrollmentRejected: 0,
      enrollmentTotal: 0,
      active: c.active,
    });
  }

  for (const e of filteredEnrollments) {
    if (e.status === "approved") totals.courseEnrollmentApproved += 1;
    if (e.status === "pending") totals.courseEnrollmentPending += 1;

    const supRow = supervisorMap.get(e.course.supervisorId);
    if (supRow) {
      if (e.status === "approved") supRow.enrollmentApproved += 1;
      if (e.status === "pending") supRow.enrollmentPending += 1;
    }

    let courseRow = courseMap.get(e.course.id);
    if (!courseRow) {
      courseRow = {
        courseId: e.course.id,
        courseTitle: e.course.title,
        supervisorId: e.course.supervisorId,
        supervisorName: e.course.supervisor.fullName,
        enrollmentApproved: 0,
        enrollmentPending: 0,
        enrollmentRejected: 0,
        enrollmentTotal: 0,
        active: e.course.active,
      };
      courseMap.set(e.course.id, courseRow);
    }
    courseRow.enrollmentTotal += 1;
    if (e.status === "approved") courseRow.enrollmentApproved += 1;
    if (e.status === "pending") courseRow.enrollmentPending += 1;
    if (e.status === "rejected") courseRow.enrollmentRejected += 1;
  }

  const monthlyMap = new Map<string, AdminMonthlyRevenueRow>();
  for (const a of filteredAppointments) {
    if (!isCollected(a)) continue;
    const d = a.createdAt;
    const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    let row = monthlyMap.get(month);
    if (!row) {
      row = {
        month,
        label: `${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
        revenue: 0,
        appointmentCount: 0,
      };
      monthlyMap.set(month, row);
    }
    row.revenue += a.amount;
    row.appointmentCount += 1;
  }

  const bySupervisor = [...supervisorMap.values()].sort(
    (a, b) => b.collectedRevenue - a.collectedRevenue
  );
  const byCourse = [...courseMap.values()].sort(
    (a, b) => b.enrollmentApproved - a.enrollmentApproved
  );
  const byService = [...serviceMap.values()].sort(
    (a, b) => b.collectedRevenue - a.collectedRevenue
  );
  const monthlyRevenue = [...monthlyMap.values()].sort((a, b) => a.month.localeCompare(b.month));

  return {
    period: {
      from: filters.from?.trim() || null,
      to: filters.to?.trim() || null,
    },
    totals,
    bySupervisor,
    byCourse,
    byService,
    monthlyRevenue,
  };
}
