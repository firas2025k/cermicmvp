import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('instagram', 'facebook', 'tiktok', 'pinterest', 'youtube');
  CREATE TYPE "public"."enum_homepage_blocks_product_usage_items_link_type" AS ENUM('custom', 'product');
  CREATE TYPE "public"."enum__homepage_v_blocks_product_usage_items_link_type" AS ENUM('custom', 'product');
  ALTER TYPE "public"."enum_header_nav_items_link_type" ADD VALUE 'category';
  CREATE TABLE "category_product_orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer NOT NULL,
  	"product_id" integer NOT NULL,
  	"position" numeric DEFAULT 999 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stock_notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"product_id" integer NOT NULL,
  	"product_title" varchar,
  	"variant_id" numeric,
  	"variant_title" varchar,
  	"notified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_trust_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "products_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_products_v_version_trust_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_blocks_hero_split_marquee_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "homepage_blocks_hero_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"left_panel_image_id" integer,
  	"left_panel_eyebrow" varchar,
  	"left_panel_title" varchar,
  	"left_panel_button_text" varchar DEFAULT 'Shop Now',
  	"left_panel_button_link" varchar DEFAULT '/shop',
  	"right_panel_image_id" integer,
  	"right_panel_eyebrow" varchar,
  	"right_panel_title" varchar,
  	"right_panel_button_text" varchar DEFAULT 'Shop Now',
  	"right_panel_button_link" varchar DEFAULT '/shop',
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_split_marquee_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"left_panel_image_id" integer,
  	"left_panel_eyebrow" varchar,
  	"left_panel_title" varchar,
  	"left_panel_button_text" varchar DEFAULT 'Shop Now',
  	"left_panel_button_link" varchar DEFAULT '/shop',
  	"right_panel_image_id" integer,
  	"right_panel_eyebrow" varchar,
  	"right_panel_title" varchar,
  	"right_panel_button_text" varchar DEFAULT 'Shop Now',
  	"right_panel_button_link" varchar DEFAULT '/shop',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "categories" ADD COLUMN "order" numeric;
  ALTER TABLE "variants" ADD COLUMN "sku" varchar;
  ALTER TABLE "_variants_v" ADD COLUMN "version_sku" varchar;
  ALTER TABLE "variant_options" ADD COLUMN "color" varchar;
  ALTER TABLE "carts" ADD COLUMN "secret" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "category_product_orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stock_notifications_id" integer;
  ALTER TABLE "header_nav_items" ADD COLUMN "link_category_id" integer;
  ALTER TABLE "header" ADD COLUMN "promotional_banner_enabled" boolean DEFAULT true;
  ALTER TABLE "header" ADD COLUMN "promotional_banner_content" varchar DEFAULT 'Kostenloser Versand ab 50€ Bestellwert';
  ALTER TABLE "header" ADD COLUMN "promotional_banner_background_color" varchar DEFAULT '#991b1b';
  ALTER TABLE "header" ADD COLUMN "promotional_banner_text_color" varchar DEFAULT '#ffffff';
  ALTER TABLE "header" ADD COLUMN "logo_image_id" integer;
  ALTER TABLE "header" ADD COLUMN "logo_label" varchar DEFAULT 'TUNISIAN TILE STUDIO';
  ALTER TABLE "header" ADD COLUMN "cart_settings_free_shipping_threshold" numeric DEFAULT 80;
  ALTER TABLE "header" ADD COLUMN "cart_settings_free_shipping_text" varchar DEFAULT 'Kostenloser Versand ab';
  ALTER TABLE "header" ADD COLUMN "cart_settings_free_shipping_reached_text" varchar DEFAULT 'Kostenloser Versand!';
  ALTER TABLE "footer" ADD COLUMN "brand_tagline" varchar DEFAULT 'Handcrafted olive wood and ceramic pieces, made with care in Austria.';
  ALTER TABLE "footer" ADD COLUMN "contact_info_address" varchar DEFAULT 'Wien, Österreich';
  ALTER TABLE "footer" ADD COLUMN "contact_info_email" varchar DEFAULT 'hello@nabea.at';
  ALTER TABLE "footer" ADD COLUMN "contact_info_phone" varchar;
  ALTER TABLE "footer" ADD COLUMN "newsletter_enabled" boolean DEFAULT false;
  ALTER TABLE "footer" ADD COLUMN "newsletter_title" varchar DEFAULT 'Stay in the loop';
  ALTER TABLE "footer" ADD COLUMN "newsletter_description" varchar DEFAULT 'New arrivals, stories, and updates — straight to your inbox.';
  ALTER TABLE "homepage_blocks_product_usage_items" ADD COLUMN "link_type" "enum_homepage_blocks_product_usage_items_link_type" DEFAULT 'custom';
  ALTER TABLE "homepage_blocks_product_usage_items" ADD COLUMN "product_id" integer;
  ALTER TABLE "_homepage_v_blocks_product_usage_items" ADD COLUMN "link_type" "enum__homepage_v_blocks_product_usage_items_link_type" DEFAULT 'custom';
  ALTER TABLE "_homepage_v_blocks_product_usage_items" ADD COLUMN "product_id" integer;
  ALTER TABLE "category_product_orders" ADD CONSTRAINT "category_product_orders_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "category_product_orders" ADD CONSTRAINT "category_product_orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_trust_bullets" ADD CONSTRAINT "products_trust_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq_items" ADD CONSTRAINT "products_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_trust_bullets" ADD CONSTRAINT "_products_v_version_trust_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq_items" ADD CONSTRAINT "_products_v_version_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_split_marquee_items" ADD CONSTRAINT "homepage_blocks_hero_split_marquee_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_split" ADD CONSTRAINT "homepage_blocks_hero_split_left_panel_image_id_media_id_fk" FOREIGN KEY ("left_panel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_split" ADD CONSTRAINT "homepage_blocks_hero_split_right_panel_image_id_media_id_fk" FOREIGN KEY ("right_panel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_split" ADD CONSTRAINT "homepage_blocks_hero_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_split_marquee_items" ADD CONSTRAINT "_homepage_v_blocks_hero_split_marquee_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_split" ADD CONSTRAINT "_homepage_v_blocks_hero_split_left_panel_image_id_media_id_fk" FOREIGN KEY ("left_panel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_split" ADD CONSTRAINT "_homepage_v_blocks_hero_split_right_panel_image_id_media_id_fk" FOREIGN KEY ("right_panel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_split" ADD CONSTRAINT "_homepage_v_blocks_hero_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "category_product_orders_category_idx" ON "category_product_orders" USING btree ("category_id");
  CREATE INDEX "category_product_orders_product_idx" ON "category_product_orders" USING btree ("product_id");
  CREATE INDEX "category_product_orders_updated_at_idx" ON "category_product_orders" USING btree ("updated_at");
  CREATE INDEX "category_product_orders_created_at_idx" ON "category_product_orders" USING btree ("created_at");
  CREATE INDEX "stock_notifications_product_idx" ON "stock_notifications" USING btree ("product_id");
  CREATE INDEX "stock_notifications_updated_at_idx" ON "stock_notifications" USING btree ("updated_at");
  CREATE INDEX "stock_notifications_created_at_idx" ON "stock_notifications" USING btree ("created_at");
  CREATE INDEX "products_trust_bullets_order_idx" ON "products_trust_bullets" USING btree ("_order");
  CREATE INDEX "products_trust_bullets_parent_id_idx" ON "products_trust_bullets" USING btree ("_parent_id");
  CREATE INDEX "products_faq_items_order_idx" ON "products_faq_items" USING btree ("_order");
  CREATE INDEX "products_faq_items_parent_id_idx" ON "products_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_trust_bullets_order_idx" ON "_products_v_version_trust_bullets" USING btree ("_order");
  CREATE INDEX "_products_v_version_trust_bullets_parent_id_idx" ON "_products_v_version_trust_bullets" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_items_order_idx" ON "_products_v_version_faq_items" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_items_parent_id_idx" ON "_products_v_version_faq_items" USING btree ("_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_split_marquee_items_order_idx" ON "homepage_blocks_hero_split_marquee_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_split_marquee_items_parent_id_idx" ON "homepage_blocks_hero_split_marquee_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_split_order_idx" ON "homepage_blocks_hero_split" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_split_parent_id_idx" ON "homepage_blocks_hero_split" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_split_path_idx" ON "homepage_blocks_hero_split" USING btree ("_path");
  CREATE INDEX "homepage_blocks_hero_split_left_panel_left_panel_image_idx" ON "homepage_blocks_hero_split" USING btree ("left_panel_image_id");
  CREATE INDEX "homepage_blocks_hero_split_right_panel_right_panel_image_idx" ON "homepage_blocks_hero_split" USING btree ("right_panel_image_id");
  CREATE INDEX "_homepage_v_blocks_hero_split_marquee_items_order_idx" ON "_homepage_v_blocks_hero_split_marquee_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_split_marquee_items_parent_id_idx" ON "_homepage_v_blocks_hero_split_marquee_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_split_order_idx" ON "_homepage_v_blocks_hero_split" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_split_parent_id_idx" ON "_homepage_v_blocks_hero_split" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_split_path_idx" ON "_homepage_v_blocks_hero_split" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_hero_split_left_panel_left_panel_imag_idx" ON "_homepage_v_blocks_hero_split" USING btree ("left_panel_image_id");
  CREATE INDEX "_homepage_v_blocks_hero_split_right_panel_right_panel_im_idx" ON "_homepage_v_blocks_hero_split" USING btree ("right_panel_image_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_category_product_orders_fk" FOREIGN KEY ("category_product_orders_id") REFERENCES "public"."category_product_orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stock_notifications_fk" FOREIGN KEY ("stock_notifications_id") REFERENCES "public"."stock_notifications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_category_id_categories_id_fk" FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_logo_image_id_media_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_usage_items" ADD CONSTRAINT "homepage_blocks_product_usage_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_usage_items" ADD CONSTRAINT "_homepage_v_blocks_product_usage_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "variants_sku_idx" ON "variants" USING btree ("sku");
  CREATE INDEX "_variants_v_version_version_sku_idx" ON "_variants_v" USING btree ("version_sku");
  CREATE INDEX "carts_secret_idx" ON "carts" USING btree ("secret");
  CREATE INDEX "payload_locked_documents_rels_category_product_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("category_product_orders_id");
  CREATE INDEX "payload_locked_documents_rels_stock_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("stock_notifications_id");
  CREATE INDEX "header_nav_items_link_link_category_idx" ON "header_nav_items" USING btree ("link_category_id");
  CREATE INDEX "header_logo_logo_image_idx" ON "header" USING btree ("logo_image_id");
  CREATE INDEX "homepage_blocks_product_usage_items_product_idx" ON "homepage_blocks_product_usage_items" USING btree ("product_id");
  CREATE INDEX "_homepage_v_blocks_product_usage_items_product_idx" ON "_homepage_v_blocks_product_usage_items" USING btree ("product_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "category_product_orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stock_notifications" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_trust_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_trust_bullets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_hero_split_marquee_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_hero_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_hero_split_marquee_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_hero_split" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "category_product_orders" CASCADE;
  DROP TABLE "stock_notifications" CASCADE;
  DROP TABLE "products_trust_bullets" CASCADE;
  DROP TABLE "products_faq_items" CASCADE;
  DROP TABLE "_products_v_version_trust_bullets" CASCADE;
  DROP TABLE "_products_v_version_faq_items" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "homepage_blocks_hero_split_marquee_items" CASCADE;
  DROP TABLE "homepage_blocks_hero_split" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_split_marquee_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_split" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_category_product_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stock_notifications_fk";
  
  ALTER TABLE "header_nav_items" DROP CONSTRAINT "header_nav_items_link_category_id_categories_id_fk";
  
  ALTER TABLE "header" DROP CONSTRAINT "header_logo_image_id_media_id_fk";
  
  ALTER TABLE "homepage_blocks_product_usage_items" DROP CONSTRAINT "homepage_blocks_product_usage_items_product_id_products_id_fk";
  
  ALTER TABLE "_homepage_v_blocks_product_usage_items" DROP CONSTRAINT "_homepage_v_blocks_product_usage_items_product_id_products_id_fk";
  
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DATA TYPE text;
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DEFAULT 'reference'::text;
  DROP TYPE "public"."enum_header_nav_items_link_type";
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom');
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DEFAULT 'reference'::"public"."enum_header_nav_items_link_type";
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_type" SET DATA TYPE "public"."enum_header_nav_items_link_type" USING "link_type"::"public"."enum_header_nav_items_link_type";
  DROP INDEX "variants_sku_idx";
  DROP INDEX "_variants_v_version_version_sku_idx";
  DROP INDEX "carts_secret_idx";
  DROP INDEX "payload_locked_documents_rels_category_product_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_stock_notifications_id_idx";
  DROP INDEX "header_nav_items_link_link_category_idx";
  DROP INDEX "header_logo_logo_image_idx";
  DROP INDEX "homepage_blocks_product_usage_items_product_idx";
  DROP INDEX "_homepage_v_blocks_product_usage_items_product_idx";
  ALTER TABLE "categories" DROP COLUMN "order";
  ALTER TABLE "variants" DROP COLUMN "sku";
  ALTER TABLE "_variants_v" DROP COLUMN "version_sku";
  ALTER TABLE "variant_options" DROP COLUMN "color";
  ALTER TABLE "carts" DROP COLUMN "secret";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "category_product_orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "stock_notifications_id";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_category_id";
  ALTER TABLE "header" DROP COLUMN "promotional_banner_enabled";
  ALTER TABLE "header" DROP COLUMN "promotional_banner_content";
  ALTER TABLE "header" DROP COLUMN "promotional_banner_background_color";
  ALTER TABLE "header" DROP COLUMN "promotional_banner_text_color";
  ALTER TABLE "header" DROP COLUMN "logo_image_id";
  ALTER TABLE "header" DROP COLUMN "logo_label";
  ALTER TABLE "header" DROP COLUMN "cart_settings_free_shipping_threshold";
  ALTER TABLE "header" DROP COLUMN "cart_settings_free_shipping_text";
  ALTER TABLE "header" DROP COLUMN "cart_settings_free_shipping_reached_text";
  ALTER TABLE "footer" DROP COLUMN "brand_tagline";
  ALTER TABLE "footer" DROP COLUMN "contact_info_address";
  ALTER TABLE "footer" DROP COLUMN "contact_info_email";
  ALTER TABLE "footer" DROP COLUMN "contact_info_phone";
  ALTER TABLE "footer" DROP COLUMN "newsletter_enabled";
  ALTER TABLE "footer" DROP COLUMN "newsletter_title";
  ALTER TABLE "footer" DROP COLUMN "newsletter_description";
  ALTER TABLE "homepage_blocks_product_usage_items" DROP COLUMN "link_type";
  ALTER TABLE "homepage_blocks_product_usage_items" DROP COLUMN "product_id";
  ALTER TABLE "_homepage_v_blocks_product_usage_items" DROP COLUMN "link_type";
  ALTER TABLE "_homepage_v_blocks_product_usage_items" DROP COLUMN "product_id";
  DROP TYPE "public"."enum_footer_social_links_platform";
  DROP TYPE "public"."enum_homepage_blocks_product_usage_items_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_product_usage_items_link_type";`)
}
