import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/** Supabase pooler (6543) → direct (5432); Prisma `directUrl` için */
function deriveDirectUrl(poolerUrl: string): string {
  let url = poolerUrl;
  if (url.includes(":6543")) {
    url = url.replace(":6543", ":5432");
  }
  url = url
    .replace(/([?&])pgbouncer=true&?/gi, "$1")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");
  return url;
}

/** Prisma schema `directUrl` için; yalnızca pooler URL varsa direct türet */
function ensurePrismaEnv(): void {
  const db = process.env.DATABASE_URL?.trim();
  if (!db) return;
  if (!process.env.DIRECT_URL?.trim()) {
    process.env.DIRECT_URL = deriveDirectUrl(db);
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
