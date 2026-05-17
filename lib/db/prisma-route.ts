import { Prisma } from "@prisma/client";

export function prismaUnavailableMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Veritabanı bağlantısı yapılandırılmamış veya erişilemiyor (.env.local içinde DATABASE_URL).";
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Bilinmeyen hata";
}
