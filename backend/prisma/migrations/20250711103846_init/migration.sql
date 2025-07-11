-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tokenPrice" DOUBLE PRECISION NOT NULL,
    "tokensAvailable" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "fundedPercent" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "launchDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
