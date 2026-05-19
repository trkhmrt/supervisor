-- Mevcut String tarih kolonları → DateTime (tek seferlik, yedek alın).
-- Yeni kurulumda: npm run db:push yeterli.

-- Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);

UPDATE "Appointment"
SET
  "startsAt" = (("date"::text || 'T' || "startTime"::text || ':00')::timestamp AT TIME ZONE 'UTC'),
  "endsAt" = (("date"::text || 'T' || "endTime"::text || ':00')::timestamp AT TIME ZONE 'UTC')
WHERE "startsAt" IS NULL AND "date" IS NOT NULL;

ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "date";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "startTime";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "endTime";
ALTER TABLE "Appointment" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "Appointment" ALTER COLUMN "endsAt" SET NOT NULL;

-- AvailabilitySlot
ALTER TABLE "AvailabilitySlot" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "AvailabilitySlot" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);

UPDATE "AvailabilitySlot"
SET
  "startsAt" = (("date"::text || 'T' || "startTime"::text || ':00')::timestamp AT TIME ZONE 'UTC'),
  "endsAt" = (("date"::text || 'T' || "endTime"::text || ':00')::timestamp AT TIME ZONE 'UTC')
WHERE "startsAt" IS NULL AND "date" IS NOT NULL;

ALTER TABLE "AvailabilitySlot" DROP COLUMN IF EXISTS "date";
ALTER TABLE "AvailabilitySlot" DROP COLUMN IF EXISTS "startTime";
ALTER TABLE "AvailabilitySlot" DROP COLUMN IF EXISTS "endTime";
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "startsAt" SET NOT NULL;
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "endsAt" SET NOT NULL;

-- BlogPost, Review, SupervisorInvite, NewsletterSubscriber, ContactMessage
ALTER TABLE "BlogPost" ALTER COLUMN "publishedAt" TYPE TIMESTAMP(3)
  USING ("publishedAt"::timestamp AT TIME ZONE 'UTC');

ALTER TABLE "Review" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)
  USING ("createdAt"::timestamp AT TIME ZONE 'UTC');

ALTER TABLE "SupervisorInvite" ALTER COLUMN "invitedAt" TYPE TIMESTAMP(3)
  USING ("invitedAt"::timestamp AT TIME ZONE 'UTC');

ALTER TABLE "SupervisorInvite" ALTER COLUMN "acceptedAt" TYPE TIMESTAMP(3)
  USING (CASE WHEN "acceptedAt" IS NULL OR "acceptedAt" = '' THEN NULL
         ELSE ("acceptedAt"::timestamp AT TIME ZONE 'UTC') END);

ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "subscribedAt" TYPE TIMESTAMP(3)
  USING ("subscribedAt"::timestamp AT TIME ZONE 'UTC');

ALTER TABLE "ContactMessage" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)
  USING ("createdAt"::timestamp AT TIME ZONE 'UTC');
