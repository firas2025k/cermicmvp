-- Migration: Add alignment to Content blocks
-- Date: 2026-09-27
-- Additive only. Safe to re-run (IF NOT EXISTS guards).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_pages_blocks_content_alignment'
  ) THEN
    CREATE TYPE "public"."enum_pages_blocks_content_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_blocks_content_alignment'
  ) THEN
    CREATE TYPE "public"."enum__pages_v_blocks_content_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_products_blocks_content_alignment'
  ) THEN
    CREATE TYPE "public"."enum_products_blocks_content_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__products_v_blocks_content_alignment'
  ) THEN
    CREATE TYPE "public"."enum__products_v_blocks_content_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;
END $$;

ALTER TABLE "pages_blocks_content"
  ADD COLUMN IF NOT EXISTS "alignment" "enum_pages_blocks_content_alignment" DEFAULT 'left';

ALTER TABLE "_pages_v_blocks_content"
  ADD COLUMN IF NOT EXISTS "alignment" "enum__pages_v_blocks_content_alignment" DEFAULT 'left';

ALTER TABLE "products_blocks_content"
  ADD COLUMN IF NOT EXISTS "alignment" "enum_products_blocks_content_alignment" DEFAULT 'left';

ALTER TABLE "_products_v_blocks_content"
  ADD COLUMN IF NOT EXISTS "alignment" "enum__products_v_blocks_content_alignment" DEFAULT 'left';
