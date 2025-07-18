/*
  Warnings:

  - You are about to drop the column `address` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `kybDocumentUrl` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `referralSource` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNo` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `teamMembers` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `vatNumber` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Client` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPhone` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_userId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "contactName",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "isBlocked",
DROP COLUMN "isVerified",
DROP COLUMN "kybDocumentUrl",
DROP COLUMN "linkedinUrl",
DROP COLUMN "phoneNumber",
DROP COLUMN "postalCode",
DROP COLUMN "referralSource",
DROP COLUMN "registrationNo",
DROP COLUMN "teamMembers",
DROP COLUMN "vatNumber",
DROP COLUMN "verifiedAt",
DROP COLUMN "website",
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT NOT NULL,
ADD COLUMN     "legalEntityNumber" TEXT,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "walletAddress" TEXT;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
