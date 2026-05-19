import { prisma } from "@/lib/prisma";
import type { NewsletterSubscriber } from "@/lib/types";

export async function subscribeNewsletter(email: string): Promise<{ ok: true; created: boolean }> {
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return { ok: true, created: false };
  }
  await prisma.newsletterSubscriber.create({
    data: { email: normalized, subscribedAt: new Date() },
  });
  return { ok: true, created: true };
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const rows = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    subscribedAt: r.subscribedAt.toISOString(),
  }));
}
