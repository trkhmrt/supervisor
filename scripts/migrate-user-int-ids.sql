-- Mevcut string User.id (UUID) → int id migrasyonu (tek seferlik).
-- Yedek alın. Supabase SQL Editor veya psql ile çalıştırın.
-- Yeni kurulumda: npx prisma db push yeterli.

-- 1) Geçici eşleme tablosu
CREATE TABLE IF NOT EXISTS "_user_id_map" (
  old_id TEXT PRIMARY KEY,
  new_id INT NOT NULL
);

-- 2) Yeni User kolonları (db push yapmadan önce manuel ise)
-- ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseAuthId" TEXT;
-- ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "id_int" SERIAL;

-- Prisma db push sonrası boş DB için seed-admin kullanın.
-- Mevcut veri için: prisma migrate veya aşağıdaki adımları DBA ile uyarlayın.

-- Örnek: Appointment superviseeId → userId (kolon yeniden adlandıktan sonra)
-- UPDATE "Appointment" a SET "userId" = m.new_id
-- FROM "_user_id_map" m WHERE a."superviseeId" = m.old_id;
