-- Migration: Add buttonAlignment to Call to Action blocks
-- Date: 2026-09-27
-- Additive only. Safe to re-run (IF NOT EXISTS guards).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_pages_blocks_cta_button_alignment'
  ) THEN
    CREATE TYPE "public"."enum_pages_blocks_cta_button_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_blocks_cta_button_alignment'
  ) THEN
    CREATE TYPE "public"."enum__pages_v_blocks_cta_button_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_products_blocks_cta_button_alignment'
  ) THEN
    CREATE TYPE "public"."enum_products_blocks_cta_button_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__products_v_blocks_cta_button_alignment'
  ) THEN
    CREATE TYPE "public"."enum__products_v_blocks_cta_button_alignment"
      AS ENUM ('left', 'center', 'right');
  END IF;
END $$;

ALTER TABLE "pages_blocks_cta"
  ADD COLUMN IF NOT EXISTS "button_alignment" "enum_pages_blocks_cta_button_alignment" DEFAULT 'right';

ALTER TABLE "_pages_v_blocks_cta"
  ADD COLUMN IF NOT EXISTS "button_alignment" "enum__pages_v_blocks_cta_button_alignment" DEFAULT 'right';

ALTER TABLE "products_blocks_cta"
  ADD COLUMN IF NOT EXISTS "button_alignment" "enum_products_blocks_cta_button_alignment" DEFAULT 'right';

ALTER TABLE "_products_v_blocks_cta"
  ADD COLUMN IF NOT EXISTS "button_alignment" "enum__products_v_blocks_cta_button_alignment" DEFAULT 'right';
