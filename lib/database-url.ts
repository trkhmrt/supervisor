/**
 * Prisma şeması `DATABASE_URL` ister; Supabase proje şablonu genelde yalnızca
 * `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` tanımlar.
 * Öncelik: açık DATABASE_URL → havuzlu Prisma URL → doğrudan (5432) → genel POSTGRES_URL
 */
export function getDatabaseUrl(): string | undefined {
  const u =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;
  return u?.trim() || undefined;
}
