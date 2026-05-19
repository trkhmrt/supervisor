import { prisma } from "@/lib/prisma";
import { sendEmail, supervisorApplicationReceivedEmailHtml } from "@/lib/email/send";
import type { SupervisorApplication } from "@/lib/types";

const INVITE_VALID_DAYS = 7;

export function inviteExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000);
}

function rowToApi(row: {
  id: string;
  fullName: string;
  email: string;
  message: string | null;
  status: "pending" | "invited" | "rejected";
  createdAt: Date;
}): SupervisorApplication {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

export async function createSupervisorApplication(input: {
  fullName: string;
  email: string;
  message?: string;
}): Promise<SupervisorApplication> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  if (!fullName || !email.includes("@")) {
    throw new ApplicationError("Ad soyad ve geçerli e-posta zorunludur.");
  }

  const existingSupervisor = await prisma.user.findFirst({
    where: { email, role: "supervisor" },
  });
  if (existingSupervisor) {
    throw new ApplicationError("Bu e-posta zaten süpervizör olarak kayıtlı.");
  }

  const pending = await prisma.supervisorApplication.findFirst({
    where: { email, status: "pending" },
  });
  if (pending) {
    throw new ApplicationError("Bu e-posta için zaten bekleyen bir talep var.");
  }

  const row = await prisma.supervisorApplication.create({
    data: {
      fullName,
      email,
      message: input.message?.trim() || null,
    },
  });

  await sendEmail({
    to: email,
    subject: "Süpervizör talebiniz alındı",
    html: supervisorApplicationReceivedEmailHtml({ fullName }),
  });

  return rowToApi(row);
}

export async function listSupervisorApplications(): Promise<SupervisorApplication[]> {
  const rows = await prisma.supervisorApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToApi);
}

export async function rejectSupervisorApplication(id: string): Promise<boolean> {
  const result = await prisma.supervisorApplication.updateMany({
    where: { id, status: "pending" },
    data: { status: "rejected" },
  });
  return result.count > 0;
}
