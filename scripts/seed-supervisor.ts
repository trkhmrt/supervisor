/**
 * Demo süpervizör — Supabase Auth + Prisma (sup-1 profiline bağlar).
 * Kullanım: npm run seed:supervisor
 * Önce: npm run seed:demo
 */
import { PrismaClient } from "@prisma/client";
import { createSupabaseAdminClient } from "../lib/supabase/admin";
import { syncSupabaseAppMetadata } from "../lib/auth/sync-supabase-metadata";

const prisma = new PrismaClient();

async function resolveSupabaseUserId(
  email: string,
  password: string,
  fullName: string
): Promise<string> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("SUPERVISOR_SUPABASE_SERVICE_ROLE_KEY tanımlı değil (.env.local)");
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "supervisor" },
  });

  if (created?.user?.id) return created.user.id;

  const msg = createError?.message ?? "";
  if (!msg.toLowerCase().includes("already")) {
    throw new Error(msg || "Supabase kullanıcısı oluşturulamadı");
  }

  let page = 1;
  const perPage = 200;
  while (page <= 10) {
    const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page, perPage });
    if (listError) throw new Error(listError.message);
    const found = listed?.users?.find((u) => u.email?.toLowerCase() === email);
    if (found?.id) {
      const { error: updateError } = await admin.auth.admin.updateUserById(found.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: "supervisor" },
      });
      if (updateError) throw new Error(updateError.message);
      return found.id;
    }
    if (!listed?.users?.length || listed.users.length < perPage) break;
    page += 1;
  }

  throw new Error(`Supabase'de ${email} bulunamadı`);
}

async function main() {
  const email = (process.env.SEED_SUPERVISOR_EMAIL ?? "abdullatif@supervizyon.com").toLowerCase();
  const password = process.env.SEED_SUPERVISOR_PASSWORD ?? "Supervisor123!";
  const fullName = process.env.SEED_SUPERVISOR_NAME ?? "Abdullatif Ramazan Çelik";
  const supervisorId = process.env.SEED_SUPERVISOR_ID ?? "sup-1";

  const supabaseAuthId = await resolveSupabaseUserId(email, password, fullName);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      supabaseAuthId,
      fullName,
      role: "supervisor",
      title: "Psikolog",
      license: "TPD No: 12345",
      emailVerified: true,
      isSuperAdmin: false,
    },
    update: {
      supabaseAuthId,
      fullName,
      role: "supervisor",
      emailVerified: true,
    },
  });

  const supervisor = await prisma.supervisor.findUnique({ where: { id: supervisorId } });
  if (supervisor) {
    await prisma.supervisor.update({
      where: { id: supervisorId },
      data: { userId: user.id },
    });
  } else {
    console.warn(`Uyarı: ${supervisorId} bulunamadı — önce npm run seed:demo çalıştırın.`);
  }

  const sync = await syncSupabaseAppMetadata(user.id);
  if (!sync.ok) {
    console.warn("app_metadata senkronu:", sync.reason, sync.detail ?? "");
  }

  console.log("Süpervizör hesabı hazır.");
  console.log(`Giriş: ${email} / ${password}`);
  console.log(`Profil: /supervizorler/${supervisorId}`);
  console.log(`Dashboard: /dashboard`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
