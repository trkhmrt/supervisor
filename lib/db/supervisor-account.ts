import { prisma } from "@/lib/prisma";

/** Giriş yapmış süpervizör kullanıcısının Supervisor kaydı */
export async function getSupervisorIdForUser(userId: number): Promise<string | null> {
  const row = await prisma.supervisor.findUnique({
    where: { userId },
    select: { id: true },
  });
  return row?.id ?? null;
}

export async function requireSupervisorIdForUser(userId: number): Promise<string> {
  const id = await getSupervisorIdForUser(userId);
  if (!id) {
    throw new SupervisorAccountError(
      "Hesabınız henüz bir süpervizör profiline bağlı değil. Yönetici ile iletişime geçin."
    );
  }
  return id;
}

export class SupervisorAccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupervisorAccountError";
  }
}
