-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "metadata" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginAt" TIMESTAMP(3);
