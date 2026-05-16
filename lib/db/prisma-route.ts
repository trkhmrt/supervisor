import { Prisma } from "@prisma/client";

export function prismaUnavailableMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return (
      "Veritabanı bağlantısı yapılandırılamadı veya erişilemiyor. " +
      ".env.local içinde DATABASE_URL veya (Supabase şablonu) POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING tanımlı olmalı. " +
      "Uygulama POSTGRES_* değerlerini otomatik kullanır; Prisma CLI için `npm run db:push` kullanın."
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Bilinmeyen hata";
}
