-- Adds an optional hex color field to variant_options.
-- When set, the storefront renders a color swatch instead of a text pill.
ALTER TABLE "variant_options" ADD COLUMN IF NOT EXISTS "color" varchar;
