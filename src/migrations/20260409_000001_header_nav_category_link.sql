-- Header nav: third link type "category" + FK to categories (run on Neon after Payload picks up schema, or alongside migrate)
-- Safe to run multiple times where noted with IF NOT EXISTS / exception handling.

DO $$ BEGIN
  ALTER TYPE "public"."enum_header_nav_items_link_type" ADD VALUE 'category';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "header_nav_items" ADD COLUMN IF NOT EXISTS "link_category_id" integer;

DO $$ BEGIN
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_category_id_categories_id_fk"
    FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "header_nav_items_link_category_idx" ON "header_nav_items" USING btree ("link_category_id");
