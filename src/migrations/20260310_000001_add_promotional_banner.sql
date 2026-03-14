-- =============================================================================
-- Migration: Add promotional banner fields to header global
-- Date: 2026-03-10
-- =============================================================================
--
-- OPTION A: Run via Payload (recommended)
--   pnpm payload migrate
--
-- OPTION B: Run manually in Neon SQL Editor
--   1. Run the SQL below
--   2. Run: pnpm payload generate:types
--
-- =============================================================================

-- Step 1: Add promotional banner columns to header table
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "promotional_banner_enabled" boolean DEFAULT true;
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "promotional_banner_content" varchar DEFAULT 'Kostenloser Versand ab 50€ Bestellwert';
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "promotional_banner_background_color" varchar DEFAULT '#991b1b';
ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "promotional_banner_text_color" varchar DEFAULT '#ffffff';

-- Step 2: Set defaults for existing header rows (if columns were just added)
UPDATE "header"
SET
  "promotional_banner_enabled" = COALESCE("promotional_banner_enabled", true),
  "promotional_banner_content" = COALESCE("promotional_banner_content", 'Kostenloser Versand ab 50€ Bestellwert'),
  "promotional_banner_background_color" = COALESCE("promotional_banner_background_color", '#991b1b'),
  "promotional_banner_text_color" = COALESCE("promotional_banner_text_color", '#ffffff')
WHERE "promotional_banner_enabled" IS NULL
   OR "promotional_banner_content" IS NULL
   OR "promotional_banner_background_color" IS NULL
   OR "promotional_banner_text_color" IS NULL;

-- Step 3 (manual run only): Register migration so Payload doesn't run it again
-- Get the next batch number: SELECT COALESCE(MAX(batch), 0) + 1 FROM payload_migrations;
-- Then run (replace 5 with your next batch number):
-- INSERT INTO "payload_migrations" ("name", "batch") VALUES ('20260310_000001_add_promotional_banner', 5);
