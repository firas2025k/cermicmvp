-- Migration: Add SKU field to variants
-- Date: 2026-04-08

ALTER TABLE "variants"
  ADD COLUMN IF NOT EXISTS "sku" varchar;

CREATE UNIQUE INDEX IF NOT EXISTS "variants_sku_unique_idx"
  ON "variants" ("sku")
  WHERE "sku" IS NOT NULL;

ALTER TABLE "_variants_v"
  ADD COLUMN IF NOT EXISTS "version_sku" varchar;

CREATE INDEX IF NOT EXISTS "_variants_v_version_sku_idx"
  ON "_variants_v" ("version_sku");
