/*
  Warnings:

  - Changed the type of `authProvider` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INVESTOR', 'CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'AZURE');

-- AlterTable: Add new columns first
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'INVESTOR',
ADD COLUMN     "timezone" TEXT;

-- Add temporary column for authProvider migration
ALTER TABLE "User" ADD COLUMN "authProvider_new" "AuthProvider";

-- Migrate existing data (assuming existing values are 'google' or 'azure')
UPDATE "User" SET "authProvider_new" = 
  CASE 
    WHEN LOWER("authProvider") = 'google' THEN 'GOOGLE'::"AuthProvider"
    WHEN LOWER("authProvider") = 'azure' THEN 'AZURE'::"AuthProvider"
    ELSE 'GOOGLE'::"AuthProvider" -- Default fallback
  END;

-- Make the new column NOT NULL
ALTER TABLE "User" ALTER COLUMN "authProvider_new" SET NOT NULL;

-- Drop old column and rename new one
ALTER TABLE "User" DROP COLUMN "authProvider";
ALTER TABLE "User" RENAME COLUMN "authProvider_new" TO "authProvider";
