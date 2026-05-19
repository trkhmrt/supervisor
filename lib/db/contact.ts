import { prisma } from "@/lib/prisma";
import type { ContactMessage } from "@/lib/types";

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const row = await prisma.contactMessage.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      createdAt: new Date(),
      read: false,
    },
  });
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    read: row.read,
  };
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const rows = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    read: r.read,
  }));
}

export async function markContactMessageRead(id: string, read: boolean): Promise<void> {
  await prisma.contactMessage.update({ where: { id }, data: { read } });
}
