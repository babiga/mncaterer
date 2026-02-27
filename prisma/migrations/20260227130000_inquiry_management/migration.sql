-- CreateEnum
CREATE TYPE "InquiryRequesterType" AS ENUM ('INDIVIDUAL', 'ORG');

-- CreateEnum
CREATE TYPE "InquiryServiceType" AS ENUM ('CORPORATE', 'PRIVATE', 'WEDDING', 'VIP', 'OTHER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "type" "InquiryRequesterType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "serviceType" "InquiryServiceType" NOT NULL,
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");
