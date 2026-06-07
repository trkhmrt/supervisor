-- Rol ve randevu statülerini enum'dan lookup tablolarına taşır.
-- Kullanım:
--   dotenv -e .env.local -- prisma db execute --file scripts/migrate-enums-to-lookup-tables.sql --schema prisma/schema.prisma
--   dotenv -e .env.local -- prisma db push

CREATE TABLE IF NOT EXISTS "Role" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS "Role_key_key" ON "Role"("key");

CREATE TABLE IF NOT EXISTS "AppointmentStatusLookup" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "colorClass" TEXT NOT NULL DEFAULT '',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "visibleToSupervisor" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS "AppointmentStatusLookup_key_key" ON "AppointmentStatusLookup"("key");

INSERT INTO "Role" ("key", "label", "description", "sortOrder", "active")
VALUES
  ('user', 'Üye', 'Süpervizörlerden randevu alabilen danışan hesabı.', 1, true),
  ('supervisor', 'Süpervizör', 'Seans veren, takvim ve randevularını yöneten uzman hesabı.', 2, true),
  ('admin', 'Admin', 'Panel yönetimi ve sistem işlemleri için yönetici hesabı.', 3, true)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "sortOrder" = EXCLUDED."sortOrder",
  "active" = true;

INSERT INTO "AppointmentStatusLookup" ("key", "label", "description", "colorClass", "sortOrder", "visibleToSupervisor", "active")
VALUES
  ('pending_payment', 'Ödeme Onayı Bekliyor', 'Randevu oluşturuldu; ödeme dekontu inceleniyor veya onay bekleniyor.', 'bg-amber-50 text-amber-700 border-amber-100', 1, false, true),
  ('confirmed', 'Aktif', 'Ödeme onaylandı; randevu geçerli ve görüşmeye hazır.', 'bg-green-50 text-green-700 border-green-100', 2, true, true),
  ('rescheduled', 'Yeniden Planlandı', 'Randevu yeni bir tarih/saate alındı.', 'bg-blue-50 text-blue-700 border-blue-100', 3, true, true),
  ('completed', 'Tamamlandı', 'Seans gerçekleştirildi.', 'bg-navy-50 text-navy-700 border-navy-100', 4, true, true),
  ('cancelled', 'İptal Edildi', 'Randevu iptal edildi.', 'border-black/15 bg-[#f1f0f0] text-black', 5, true, true)
ON CONFLICT ("key") DO UPDATE SET
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "colorClass" = EXCLUDED."colorClass",
  "sortOrder" = EXCLUDED."sortOrder",
  "visibleToSupervisor" = EXCLUDED."visibleToSupervisor",
  "active" = true;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" INTEGER;

UPDATE "User" u
SET "roleId" = r."id"
FROM "Role" r
WHERE u."roleId" IS NULL
  AND r."key" = u."role"::text;

UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "key" = 'user' LIMIT 1)
WHERE "roleId" IS NULL;

ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "statusId" INTEGER;

UPDATE "Appointment" a
SET "statusId" = s."id"
FROM "AppointmentStatusLookup" s
WHERE a."statusId" IS NULL
  AND s."key" = a."status"::text;

UPDATE "Appointment"
SET "statusId" = (SELECT "id" FROM "AppointmentStatusLookup" WHERE "key" = 'pending_payment' LIMIT 1)
WHERE "statusId" IS NULL;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_statusId_fkey";
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "AppointmentStatusLookup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "statusId" SET NOT NULL;

ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "status";

DROP TYPE IF EXISTS "UserRole";
DROP TYPE IF EXISTS "AppointmentStatus";

CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE INDEX IF NOT EXISTS "Appointment_statusId_idx" ON "Appointment"("statusId");
