-- AlterTable
ALTER TABLE "KycRecord" ADD COLUMN "provider" TEXT,
ADD COLUMN "referenceId" TEXT,
ADD COLUMN "providerData" JSONB;