/**
 * dotenv-cli ile .env.local yüklendikten sonra çalışır.
 * DATABASE_URL yoksa Supabase POSTGRES_* değişkenlerinden türetir, sonra Prisma CLI çağırır.
 */
const { spawnSync } = require("node:child_process");

const env = { ...process.env };
if (!env.DATABASE_URL?.trim()) {
  env.DATABASE_URL =
    env.POSTGRES_PRISMA_URL || env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || "";
}

const prismaArgs = process.argv.slice(2);
if (!prismaArgs.length) {
  console.error("Kullanım: node scripts/prisma-env.cjs <prisma komutu> …");
  process.exit(1);
}

const result = spawnSync("npx", ["prisma", ...prismaArgs], {
  stdio: "inherit",
  env,
  cwd: process.cwd(),
  shell: process.platform === "win32",
});

process.exit(result.status === null ? 1 : result.status);
