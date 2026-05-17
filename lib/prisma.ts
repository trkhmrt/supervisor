import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/** Prisma schema `directUrl` için; Vercel'de yalnızca DATABASE_URL tanımlıysa build/runtime hata vermesin */
function ensurePrismaEnv(): void {
  const db = process.env.DATABASE_URL?.trim();
  if (!db) return;
  if (!process.env.DIRECT_URL?.trim()) {
    process.env.DIRECT_URL = db;
  }
}

function createPrismaClient(): PrismaClient {
  ensurePrismaEnv();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Lazy proxy — import anında bağlantı açılmaz (Vercel build için) */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
