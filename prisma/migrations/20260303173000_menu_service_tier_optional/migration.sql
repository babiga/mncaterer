-- Make Menu -> ServiceTier relation optional
ALTER TABLE "Menu" ALTER COLUMN "serviceTierId" DROP NOT NULL;

ALTER TABLE "Menu" DROP CONSTRAINT IF EXISTS "Menu_serviceTierId_fkey";
ALTER TABLE "Menu"
  ADD CONSTRAINT "Menu_serviceTierId_fkey"
  FOREIGN KEY ("serviceTierId") REFERENCES "ServiceTier"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
