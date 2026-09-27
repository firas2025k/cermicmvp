-- Migration: Add optional title + description to Content blocks
-- Date: 2026-09-27
-- Additive only. Safe to re-run (IF NOT EXISTS guards).
-- Affects Pages and Products (shared Content block).

ALTER TABLE "pages_blocks_content"
  ADD COLUMN IF NOT EXISTS "title" varchar,
  ADD COLUMN IF NOT EXISTS "description" varchar;

ALTER TABLE "_pages_v_blocks_content"
  ADD COLUMN IF NOT EXISTS "title" varchar,
  ADD COLUMN IF NOT EXISTS "description" varchar;

ALTER TABLE "products_blocks_content"
  ADD COLUMN IF NOT EXISTS "title" varchar,
  ADD COLUMN IF NOT EXISTS "description" varchar;

ALTER TABLE "_products_v_blocks_content"
  ADD COLUMN IF NOT EXISTS "title" varchar,
  ADD COLUMN IF NOT EXISTS "description" varchar;
