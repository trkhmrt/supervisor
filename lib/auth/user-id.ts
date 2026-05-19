/** Route / JWT parametresinden Prisma User.id (int) */
export function parseUserIdParam(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
