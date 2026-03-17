-- AlterTable
ALTER TABLE "ChefProfile" ADD COLUMN     "awards" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "degrees" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "education" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "events" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "experience" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[];
