-- Expand Product FAQ feature icon enum with curated Lucide-backed options
-- and set FAQ heading to German copy.

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'unique';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'durable';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'leaf';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'tree';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'heart';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'hand';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'droplet';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'sun';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'award';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'recycle';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'gem';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'clock';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'flame';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'utensils';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'sprout';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'checkCircle';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "enum_product_faq_section_feature_icons_icon" ADD VALUE IF NOT EXISTS 'shieldCheck';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE product_faq_section
SET heading = 'Häufig gestellte Fragen'
WHERE heading IS NULL
   OR heading ILIKE '%faq%';
