-- Adım 1: 'user' değerini enum'a ekle (ayrı transaction gerekir)
DO $$
BEGIN
  ALTER TYPE "UserRole" ADD VALUE 'user';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
