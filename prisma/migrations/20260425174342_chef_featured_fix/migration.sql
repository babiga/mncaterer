/*
  Warnings:

  - You are about to drop the column `isFeatured` on the `DashboardUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChefProfile" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "DashboardUser" DROP COLUMN "isFeatured";
