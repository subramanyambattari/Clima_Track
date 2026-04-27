-- Allow users created through Google OAuth to exist without a password hash.
ALTER TABLE "User"
ALTER COLUMN "passwordHash" DROP NOT NULL;
