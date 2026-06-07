/**
 * İlk süper admin + izin kayıtları.
 * Kullanım: npx dotenv -e .env.local -- npx tsx scripts/seed-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSION_SEED } from "../lib/auth/permissions";
import { roleConnect, seedRoleAndStatusLookups } from "../lib/db/lookups";

const prisma = new PrismaClient();

async function main() {
  await seedRoleAndStatusLookups(prisma);

  for (const p of PERMISSION_SEED) {
    await prisma.permission.upsert({
      where: { key: p.key },
      create: { key: p.key, description: p.description },
      update: { description: p.description },
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@supervizyon.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: hash,
      fullName: "Süper Admin",
      role: roleConnect("admin"),
      isSuperAdmin: true,
      emailVerified: true,
    },
    update: {
      password: hash,
      role: roleConnect("admin"),
      isSuperAdmin: true,
    },
  });

  console.log("Permissions seeded.");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
