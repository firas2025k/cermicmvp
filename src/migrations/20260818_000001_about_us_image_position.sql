-- Migration: Add image position option to About Us homepage block
-- Run in Neon SQL Editor
-- Date: 2026-08-18
--
-- Adds a dashboard control so editors can choose:
--   imageLeft  = image left / text right (current default)
--   imageRight = text left / image right

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum_homepage_blocks_about_us_image_position'
  ) THEN
    CREATE TYPE "public"."enum_homepage_blocks_about_us_image_position"
      AS ENUM ('imageLeft', 'imageRight');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'enum__homepage_v_blocks_about_us_image_position'
  ) THEN
    CREATE TYPE "public"."enum__homepage_v_blocks_about_us_image_position"
      AS ENUM ('imageLeft', 'imageRight');
  END IF;
END $$;

ALTER TABLE "homepage_blocks_about_us"
  ADD COLUMN IF NOT EXISTS "image_position" "enum_homepage_blocks_about_us_image_position"
  DEFAULT 'imageLeft';

ALTER TABLE "_homepage_v_blocks_about_us"
  ADD COLUMN IF NOT EXISTS "image_position" "enum__homepage_v_blocks_about_us_image_position"
  DEFAULT 'imageLeft';
