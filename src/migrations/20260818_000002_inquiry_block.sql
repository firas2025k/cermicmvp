-- Migration: Add Inquiry homepage block tables
-- Date: 2026-08-18

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_homepage_blocks_inquiry_image_position'
  ) THEN
    CREATE TYPE "public"."enum_homepage_blocks_inquiry_image_position"
      AS ENUM ('imageLeft', 'imageRight');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__homepage_v_blocks_inquiry_image_position'
  ) THEN
    CREATE TYPE "public"."enum__homepage_v_blocks_inquiry_image_position"
      AS ENUM ('imageLeft', 'imageRight');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "homepage_blocks_inquiry" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "title" varchar DEFAULT 'Anfragen',
  "image_id" integer,
  "image_caption" varchar,
  "image_position" "enum_homepage_blocks_inquiry_image_position" DEFAULT 'imageRight',
  "learn_more_label" varchar DEFAULT 'Unverbindlich anfragen',
  "learn_more_url" varchar DEFAULT '/anfrage',
  "content" jsonb,
  "block_name" varchar
);

CREATE TABLE IF NOT EXISTS "_homepage_v_blocks_inquiry" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "_path" text NOT NULL,
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar DEFAULT 'Anfragen',
  "image_id" integer,
  "image_caption" varchar,
  "image_position" "enum__homepage_v_blocks_inquiry_image_position" DEFAULT 'imageRight',
  "learn_more_label" varchar DEFAULT 'Unverbindlich anfragen',
  "learn_more_url" varchar DEFAULT '/anfrage',
  "content" jsonb,
  "_uuid" varchar,
  "block_name" varchar
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'homepage_blocks_inquiry_image_id_media_id_fk'
  ) THEN
    ALTER TABLE "homepage_blocks_inquiry"
      ADD CONSTRAINT "homepage_blocks_inquiry_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'homepage_blocks_inquiry_parent_id_fk'
  ) THEN
    ALTER TABLE "homepage_blocks_inquiry"
      ADD CONSTRAINT "homepage_blocks_inquiry_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_homepage_v_blocks_inquiry_image_id_media_id_fk'
  ) THEN
    ALTER TABLE "_homepage_v_blocks_inquiry"
      ADD CONSTRAINT "_homepage_v_blocks_inquiry_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = '_homepage_v_blocks_inquiry_parent_id_fk'
  ) THEN
    ALTER TABLE "_homepage_v_blocks_inquiry"
      ADD CONSTRAINT "_homepage_v_blocks_inquiry_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "homepage_blocks_inquiry_order_idx"
  ON "homepage_blocks_inquiry" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "homepage_blocks_inquiry_parent_id_idx"
  ON "homepage_blocks_inquiry" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "homepage_blocks_inquiry_path_idx"
  ON "homepage_blocks_inquiry" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "homepage_blocks_inquiry_image_idx"
  ON "homepage_blocks_inquiry" USING btree ("image_id");

CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_inquiry_order_idx"
  ON "_homepage_v_blocks_inquiry" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_inquiry_parent_id_idx"
  ON "_homepage_v_blocks_inquiry" USING btree ("_parent_id");
CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_inquiry_path_idx"
  ON "_homepage_v_blocks_inquiry" USING btree ("_path");
CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_inquiry_image_idx"
  ON "_homepage_v_blocks_inquiry" USING btree ("image_id");
