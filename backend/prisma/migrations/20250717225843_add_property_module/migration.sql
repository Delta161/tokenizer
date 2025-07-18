/*
  Warnings:

  - The values [PENDING_REVIEW,LIVE,SOLD_OUT,ARCHIVED] on the enum `PropertyStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blockchain` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `completionDate` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `constructionStartDate` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `contractAddress` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `expectedYield` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `lat` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `projectStage` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `publishAt` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `reservationLimit` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `reservedBy` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `reviewNotes` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokens` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `translations` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `valuation` on the `Property` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenSymbol]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apr` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `irr` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minInvestment` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenSymbol` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokensAvailablePercent` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueGrowth` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Made the column `city` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PropertyStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "Property" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Property" ALTER COLUMN "status" TYPE "PropertyStatus_new" USING ("status"::text::"PropertyStatus_new");
ALTER TYPE "PropertyStatus" RENAME TO "PropertyStatus_old";
ALTER TYPE "PropertyStatus_new" RENAME TO "PropertyStatus";
DROP TYPE "PropertyStatus_old";
ALTER TABLE "Property" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_clientId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "blockchain",
DROP COLUMN "category",
DROP COLUMN "completionDate",
DROP COLUMN "constructionStartDate",
DROP COLUMN "contractAddress",
DROP COLUMN "currency",
DROP COLUMN "expectedYield",
DROP COLUMN "isPublic",
DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "location",
DROP COLUMN "projectStage",
DROP COLUMN "publishAt",
DROP COLUMN "reservationLimit",
DROP COLUMN "reservedBy",
DROP COLUMN "reviewNotes",
DROP COLUMN "reviewedBy",
DROP COLUMN "tags",
DROP COLUMN "totalTokens",
DROP COLUMN "translations",
DROP COLUMN "valuation",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "apr" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "irr" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "minInvestment" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "tokenSymbol" TEXT NOT NULL,
ADD COLUMN     "tokensAvailablePercent" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "valueGrowth" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Property_tokenSymbol_key" ON "Property"("tokenSymbol");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
