-- Adım 2: supervisee -> user (Adım 1 commit edildikten sonra)
UPDATE "User"
SET role = 'user'::"UserRole"
WHERE role::text = 'supervisee';
