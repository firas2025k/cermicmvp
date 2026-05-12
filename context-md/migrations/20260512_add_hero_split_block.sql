-- ============================================================
-- Migration: Add HeroSplit block tables
-- Created:   2026-05-12
-- Reason:    HeroSplitBlock added to Homepage global. Payload
--            expects these tables but they don't exist yet.
-- Run this directly on Neon DB (payload-neon project).
-- ============================================================

-- ── 1. Live block table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "homepage_blocks_hero_split" (
  "_order"                   integer       NOT NULL,
  "_parent_id"               integer       NOT NULL,
  "_path"                    text          NOT NULL,
  "id"                       varchar       PRIMARY KEY NOT NULL,
  "left_panel_image_id"      integer,
  "left_panel_eyebrow"       varchar,
  "left_panel_title"         varchar,
  "left_panel_button_text"   varchar       DEFAULT 'Shop Now',
  "left_panel_button_link"   varchar       DEFAULT '/shop',
  "right_panel_image_id"     integer,
  "right_panel_eyebrow"      varchar,
  "right_panel_title"        varchar,
  "right_panel_button_text"  varchar       DEFAULT 'Shop Now',
  "right_panel_button_link"  varchar       DEFAULT '/shop',
  "block_name"               varchar
);

-- ── 2. Live marquee items child table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "homepage_blocks_hero_split_marquee_items" (
  "_order"      integer  NOT NULL,
  "_parent_id"  varchar  NOT NULL,
  "id"          varchar  PRIMARY KEY NOT NULL,
  "text"        varchar  NOT NULL
);

-- ── 3. Versioning block table (_homepage_v) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "_homepage_v_blocks_hero_split" (
  "_order"                   integer  NOT NULL,
  "_parent_id"               integer  NOT NULL,
  "_path"                    text     NOT NULL,
  "id"                       serial   PRIMARY KEY NOT NULL,
  "left_panel_image_id"      integer,
  "left_panel_eyebrow"       varchar,
  "left_panel_title"         varchar,
  "left_panel_button_text"   varchar  DEFAULT 'Shop Now',
  "left_panel_button_link"   varchar  DEFAULT '/shop',
  "right_panel_image_id"     integer,
  "right_panel_eyebrow"      varchar,
  "right_panel_title"        varchar,
  "right_panel_button_text"  varchar  DEFAULT 'Shop Now',
  "right_panel_button_link"  varchar  DEFAULT '/shop',
  "_uuid"                    varchar,
  "block_name"               varchar
);

-- ── 4. Versioning marquee items child table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "_homepage_v_blocks_hero_split_marquee_items" (
  "_order"      integer  NOT NULL,
  "_parent_id"  integer  NOT NULL,
  "id"          serial   PRIMARY KEY NOT NULL,
  "text"        varchar  NOT NULL,
  "_uuid"       varchar
);

-- ── 5. Foreign key constraints (live tables) ─────────────────────────────────

ALTER TABLE "homepage_blocks_hero_split"
  ADD CONSTRAINT "homepage_blocks_hero_split_left_panel_image_id_media_id_fk"
  FOREIGN KEY ("left_panel_image_id") REFERENCES "public"."media"("id")
  ON DELETE set null ON UPDATE no action;

ALTER TABLE "homepage_blocks_hero_split"
  ADD CONSTRAINT "homepage_blocks_hero_split_right_panel_image_id_media_id_fk"
  FOREIGN KEY ("right_panel_image_id") REFERENCES "public"."media"("id")
  ON DELETE set null ON UPDATE no action;

ALTER TABLE "homepage_blocks_hero_split"
  ADD CONSTRAINT "homepage_blocks_hero_split_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "homepage_blocks_hero_split_marquee_items"
  ADD CONSTRAINT "homepage_blocks_hero_split_marquee_items_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_hero_split"("id")
  ON DELETE cascade ON UPDATE no action;

-- ── 6. Foreign key constraints (versioning tables) ───────────────────────────

ALTER TABLE "_homepage_v_blocks_hero_split"
  ADD CONSTRAINT "_homepage_v_blocks_hero_split_left_panel_image_id_media_id_fk"
  FOREIGN KEY ("left_panel_image_id") REFERENCES "public"."media"("id")
  ON DELETE set null ON UPDATE no action;

ALTER TABLE "_homepage_v_blocks_hero_split"
  ADD CONSTRAINT "_homepage_v_blocks_hero_split_right_panel_image_id_media_id_fk"
  FOREIGN KEY ("right_panel_image_id") REFERENCES "public"."media"("id")
  ON DELETE set null ON UPDATE no action;

ALTER TABLE "_homepage_v_blocks_hero_split"
  ADD CONSTRAINT "_homepage_v_blocks_hero_split_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "_homepage_v_blocks_hero_split_marquee_items"
  ADD CONSTRAINT "_homepage_v_blocks_hero_split_marquee_items_parent_id_fk"
  FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_hero_split"("id")
  ON DELETE cascade ON UPDATE no action;

-- ── 7. Indexes (live tables) ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_order_idx"
  ON "homepage_blocks_hero_split" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_parent_id_idx"
  ON "homepage_blocks_hero_split" USING btree ("_parent_id");

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_path_idx"
  ON "homepage_blocks_hero_split" USING btree ("_path");

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_left_panel_image_idx"
  ON "homepage_blocks_hero_split" USING btree ("left_panel_image_id");

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_right_panel_image_idx"
  ON "homepage_blocks_hero_split" USING btree ("right_panel_image_id");

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_marquee_items_order_idx"
  ON "homepage_blocks_hero_split_marquee_items" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "homepage_blocks_hero_split_marquee_items_parent_id_idx"
  ON "homepage_blocks_hero_split_marquee_items" USING btree ("_parent_id");

-- ── 8. Indexes (versioning tables) ──────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_hero_split_order_idx"
  ON "_homepage_v_blocks_hero_split" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_hero_split_parent_id_idx"
  ON "_homepage_v_blocks_hero_split" USING btree ("_parent_id");

CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_hero_split_path_idx"
  ON "_homepage_v_blocks_hero_split" USING btree ("_path");

CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_hero_split_marquee_items_order_idx"
  ON "_homepage_v_blocks_hero_split_marquee_items" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_hero_split_marquee_items_parent_id_idx"
  ON "_homepage_v_blocks_hero_split_marquee_items" USING btree ("_parent_id");
