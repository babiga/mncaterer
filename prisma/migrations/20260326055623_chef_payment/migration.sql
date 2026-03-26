-- CreateEnum
CREATE TYPE "ChefTaxStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');

-- AlterTable
ALTER TABLE "BankTransferSetting" ADD COLUMN     "initialTaxAmount" DECIMAL(12,2) NOT NULL DEFAULT 100000;

-- AlterTable
ALTER TABLE "ChefProfile" ADD COLUMN     "taxStatus" "ChefTaxStatus" NOT NULL DEFAULT 'PENDING';
