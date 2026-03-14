-- Migration: Add product link option to Product Usage block items
-- Run in Neon SQL Editor, then run: pnpm payload migrate (or register in payload_migrations)
-- Date: 2026-03-11

-- Add link_type and product_id to homepage_blocks_product_usage_items
ALTER TABLE "homepage_blocks_product_usage_items"
  ADD COLUMN IF NOT EXISTS "link_type" varchar DEFAULT 'custom';
ALTER TABLE "homepage_blocks_product_usage_items"
  ADD COLUMN IF NOT EXISTS "product_id" integer;
ALTER TABLE "homepage_blocks_product_usage_items"
  DROP CONSTRAINT IF EXISTS "homepage_blocks_product_usage_items_product_id_products_id_fk";
ALTER TABLE "homepage_blocks_product_usage_items"
  ADD CONSTRAINT "homepage_blocks_product_usage_items_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
CREATE INDEX IF NOT EXISTS "homepage_blocks_product_usage_items_product_id_idx"
  ON "homepage_blocks_product_usage_items" USING btree ("product_id");

-- Same for versions table
ALTER TABLE "_homepage_v_blocks_product_usage_items"
  ADD COLUMN IF NOT EXISTS "link_type" varchar DEFAULT 'custom';
ALTER TABLE "_homepage_v_blocks_product_usage_items"
  ADD COLUMN IF NOT EXISTS "product_id" integer;
ALTER TABLE "_homepage_v_blocks_product_usage_items"
  DROP CONSTRAINT IF EXISTS "_homepage_v_blocks_product_usage_items_product_id_products_id_fk";
ALTER TABLE "_homepage_v_blocks_product_usage_items"
  ADD CONSTRAINT "_homepage_v_blocks_product_usage_items_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
  ON DELETE SET NULL ON UPDATE NO ACTION;
CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_product_usage_items_product_id_idx"
  ON "_homepage_v_blocks_product_usage_items" USING btree ("product_id");
