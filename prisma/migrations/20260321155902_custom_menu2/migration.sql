-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "customMenuData" JSONB,
ADD COLUMN     "isCustomMenu" BOOLEAN NOT NULL DEFAULT false;
