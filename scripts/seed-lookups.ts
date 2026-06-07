/**
 * Rol ve randevu (ödeme) statü lookup tablolarını doldurur.
 * Kullanım: npm run seed:lookups
 */
import { PrismaClient } from "@prisma/client";
import { seedRoleAndStatusLookups } from "../lib/db/lookups";

const prisma = new PrismaClient();

async function main() {
  await seedRoleAndStatusLookups(prisma);
  const roles = await prisma.role.count();
  const statuses = await prisma.appointmentStatusLookup.count();
  console.log(`Lookup seed tamam: ${roles} rol, ${statuses} randevu statüsü.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
