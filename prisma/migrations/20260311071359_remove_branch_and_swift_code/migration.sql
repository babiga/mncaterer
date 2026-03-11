/*
  Warnings:

  - You are about to drop the column `branchName` on the `BankTransferSetting` table. All the data in the column will be lost.
  - You are about to drop the column `swiftCode` on the `BankTransferSetting` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `ChefProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankTransferSetting" DROP COLUMN "branchName",
DROP COLUMN "swiftCode";

-- AlterTable
ALTER TABLE "ChefProfile" DROP COLUMN "hourlyRate";

-- CreateTable
CREATE TABLE "VisitorMetric" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL DEFAULT 'desktop',
    "browser" TEXT,
    "os" TEXT,
    "referer" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorMetric_timestamp_idx" ON "VisitorMetric"("timestamp");
