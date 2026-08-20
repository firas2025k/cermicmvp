-- =============================================================================
-- Migration: Product FAQ Section global + per-product toggle
-- Date: 2026-08-20
-- =============================================================================
--
-- Adds:
--   - Global tables for Product FAQ Section (feature icons + image + FAQ items)
--   - products.show_general_faq / _products_v.version_show_general_faq
--   - Default feature icon labels (German)
--
-- Run in Neon SQL Editor, then register:
--   INSERT INTO "payload_migrations" ("name", "batch")
--   VALUES (
--     '20260820_132400_add_product_faq_section',
--     (SELECT COALESCE(MAX(batch), 0) + 1 FROM payload_migrations)
--   );
--
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_product_faq_section_feature_icons_icon'
  ) THEN
    CREATE TYPE "public"."enum_product_faq_section_feature_icons_icon"
      AS ENUM ('knifeFriendly', 'colorfulGrain', 'foodSafe', 'antibacterial', 'easyCare');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "product_faq_section" (
  "id" serial PRIMARY KEY NOT NULL,
  "heading" varchar DEFAULT 'FAQ''S',
  "image_id" integer,
  "updated_at" timestamp(3) with time zone,
  "created_at" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "product_faq_section_feature_icons" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "icon" "enum_product_faq_section_feature_icons_icon" DEFAULT 'knifeFriendly' NOT NULL,
  "label" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_faq_section_items" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "question" varchar NOT NULL,
  "answer" jsonb NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_faq_section_image_id_media_id_fk'
  ) THEN
    ALTER TABLE "product_faq_section"
      ADD CONSTRAINT "product_faq_section_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_faq_section_feature_icons_parent_id_fk'
  ) THEN
    ALTER TABLE "product_faq_section_feature_icons"
      ADD CONSTRAINT "product_faq_section_feature_icons_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."product_faq_section"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_faq_section_items_parent_id_fk'
  ) THEN
    ALTER TABLE "product_faq_section_items"
      ADD CONSTRAINT "product_faq_section_items_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."product_faq_section"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "product_faq_section_image_idx"
  ON "product_faq_section" USING btree ("image_id");
CREATE INDEX IF NOT EXISTS "product_faq_section_feature_icons_order_idx"
  ON "product_faq_section_feature_icons" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "product_faq_section_feature_icons_parent_id_idx"
  ON "product_faq_section_feature_icons" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "product_faq_section_items_order_idx"
  ON "product_faq_section_items" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "product_faq_section_items_parent_id_idx"
  ON "product_faq_section_items" USING btree ("_parent_id");

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "show_general_faq" boolean DEFAULT false;
ALTER TABLE "_products_v"
  ADD COLUMN IF NOT EXISTS "version_show_general_faq" boolean DEFAULT false;

INSERT INTO "product_faq_section" ("id", "heading", "updated_at", "created_at")
SELECT 1, 'FAQ''S', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "product_faq_section" LIMIT 1);

INSERT INTO "product_faq_section_feature_icons" ("id", "_order", "_parent_id", "icon", "label")
SELECT v.id, v.ord, p.id, v.icon::"enum_product_faq_section_feature_icons_icon", v.label
FROM "product_faq_section" p
CROSS JOIN (
  VALUES
    ('pfs_icon_1', 1, 'knifeFriendly', 'Messerfreundlich'),
    ('pfs_icon_2', 2, 'colorfulGrain', 'Farbenprächtig'),
    ('pfs_icon_3', 3, 'foodSafe', 'Lebensmittelecht'),
    ('pfs_icon_4', 4, 'antibacterial', 'Antibakteriell'),
    ('pfs_icon_5', 5, 'easyCare', 'Pflegeleicht')
) AS v(id, ord, icon, label)
WHERE NOT EXISTS (SELECT 1 FROM "product_faq_section_feature_icons" LIMIT 1);
