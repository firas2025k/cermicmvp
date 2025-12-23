import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // First, handle the categories parent_id column addition (our main goal)
  // Check if column already exists before adding it
  const columnExists = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='categories' AND column_name='parent_id'
  `)
  
  if (columnExists.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
      ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" 
        FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") 
        ON DELETE set null ON UPDATE no action;
      CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
    `)
  }

  // Then handle homepage tables/types (only if they don't exist)
  await db.execute(sql`
   DO $$ BEGIN
   CREATE TYPE "public"."enum_homepage_blocks_product_carousel_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_homepage_blocks_product_carousel_sort" AS ENUM('-createdAt', 'createdAt', 'title', '-title');
  CREATE TYPE "public"."enum_homepage_blocks_category_banner_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_homepage_blocks_category_banner_sort" AS ENUM('-createdAt', 'createdAt', 'title', '-title');
  CREATE TYPE "public"."enum_homepage_blocks_brand_story_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_homepage_blocks_brand_story_links_link_appearance" AS ENUM('default');
  CREATE TYPE "public"."enum_homepage_blocks_feature_circles_background_color" AS ENUM('red', 'amber', 'neutral');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_blocks_product_carousel_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__homepage_v_blocks_product_carousel_sort" AS ENUM('-createdAt', 'createdAt', 'title', '-title');
  CREATE TYPE "public"."enum__homepage_v_blocks_category_banner_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__homepage_v_blocks_category_banner_sort" AS ENUM('-createdAt', 'createdAt', 'title', '-title');
  CREATE TYPE "public"."enum__homepage_v_blocks_brand_story_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__homepage_v_blocks_brand_story_links_link_appearance" AS ENUM('default');
  CREATE TYPE "public"."enum__homepage_v_blocks_feature_circles_background_color" AS ENUM('red', 'amber', 'neutral');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "homepage_blocks_hero_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_text" varchar,
  	"button_link" varchar DEFAULT '/shop'
  );
  
  CREATE TABLE "homepage_blocks_hero_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"auto_play" boolean DEFAULT true,
  	"auto_play_interval" numeric DEFAULT 5000,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_product_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"populate_by" "enum_homepage_blocks_product_carousel_populate_by" DEFAULT 'collection',
  	"sort" "enum_homepage_blocks_product_carousel_sort" DEFAULT '-createdAt',
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_category_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"populate_by" "enum_homepage_blocks_category_banner_populate_by" DEFAULT 'collection',
  	"sort" "enum_homepage_blocks_category_banner_sort" DEFAULT '-createdAt',
  	"limit" numeric DEFAULT 4,
  	"cta_text" varchar DEFAULT 'Jetzt entdecken',
  	"cta_link" varchar DEFAULT '/shop',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_brand_story_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_homepage_blocks_brand_story_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_homepage_blocks_brand_story_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "homepage_blocks_brand_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"background_image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_feature_circles_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"label" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "homepage_blocks_feature_circles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background_color" "enum_homepage_blocks_feature_circles_background_color" DEFAULT 'red',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_media_mentions_outlets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "homepage_blocks_media_mentions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_partner_logos_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "homepage_blocks_partner_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_rating" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_customer_reviews_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"rating" numeric DEFAULT 5
  );
  
  CREATE TABLE "homepage_blocks_customer_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Kundenbewertungen',
  	"show_view_all" boolean DEFAULT true,
  	"view_all_link" varchar DEFAULT '/reviews',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_product_usage_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"link" varchar DEFAULT '/shop',
  	"link_text" varchar DEFAULT 'Mehr erfahren'
  );
  
  CREATE TABLE "homepage_blocks_product_usage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_about_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Über uns',
  	"image_id" integer,
  	"image_caption" varchar DEFAULT 'Unser Team',
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"products_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"subtitle" varchar,
  	"button_text" varchar,
  	"button_link" varchar DEFAULT '/shop',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_hero_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"auto_play" boolean DEFAULT true,
  	"auto_play_interval" numeric DEFAULT 5000,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_product_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"populate_by" "enum__homepage_v_blocks_product_carousel_populate_by" DEFAULT 'collection',
  	"sort" "enum__homepage_v_blocks_product_carousel_sort" DEFAULT '-createdAt',
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_category_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"populate_by" "enum__homepage_v_blocks_category_banner_populate_by" DEFAULT 'collection',
  	"sort" "enum__homepage_v_blocks_category_banner_sort" DEFAULT '-createdAt',
  	"limit" numeric DEFAULT 4,
  	"cta_text" varchar DEFAULT 'Jetzt entdecken',
  	"cta_link" varchar DEFAULT '/shop',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_brand_story_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__homepage_v_blocks_brand_story_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__homepage_v_blocks_brand_story_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_brand_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"background_image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_feature_circles_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"label" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_feature_circles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background_color" "enum__homepage_v_blocks_feature_circles_background_color" DEFAULT 'red',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_media_mentions_outlets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_media_mentions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_partner_logos_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_partner_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_rating" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_customer_reviews_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"rating" numeric DEFAULT 5,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_customer_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Kundenbewertungen',
  	"show_view_all" boolean DEFAULT true,
  	"view_all_link" varchar DEFAULT '/reviews',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_product_usage_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"link" varchar DEFAULT '/shop',
  	"link_text" varchar DEFAULT 'Mehr erfahren',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_product_usage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_about_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Über uns',
  	"image_id" integer,
  	"image_caption" varchar DEFAULT 'Unser Team',
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"products_id" integer,
  	"pages_id" integer
  );
  
  ALTER TABLE "homepage_blocks_hero_carousel_slides" ADD CONSTRAINT "homepage_blocks_hero_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_carousel_slides" ADD CONSTRAINT "homepage_blocks_hero_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_hero_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero_carousel" ADD CONSTRAINT "homepage_blocks_hero_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_carousel" ADD CONSTRAINT "homepage_blocks_product_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_category_banner" ADD CONSTRAINT "homepage_blocks_category_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_brand_story_links" ADD CONSTRAINT "homepage_blocks_brand_story_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_brand_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_brand_story" ADD CONSTRAINT "homepage_blocks_brand_story_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_brand_story" ADD CONSTRAINT "homepage_blocks_brand_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_feature_circles_features" ADD CONSTRAINT "homepage_blocks_feature_circles_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_feature_circles_features" ADD CONSTRAINT "homepage_blocks_feature_circles_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_feature_circles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_feature_circles" ADD CONSTRAINT "homepage_blocks_feature_circles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_media_mentions_outlets" ADD CONSTRAINT "homepage_blocks_media_mentions_outlets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_media_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_media_mentions" ADD CONSTRAINT "homepage_blocks_media_mentions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_partner_logos_partners" ADD CONSTRAINT "homepage_blocks_partner_logos_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_partner_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_partner_logos" ADD CONSTRAINT "homepage_blocks_partner_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_customer_reviews_reviews" ADD CONSTRAINT "homepage_blocks_customer_reviews_reviews_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_customer_reviews_reviews" ADD CONSTRAINT "homepage_blocks_customer_reviews_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_customer_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_customer_reviews" ADD CONSTRAINT "homepage_blocks_customer_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_usage_items" ADD CONSTRAINT "homepage_blocks_product_usage_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_usage_items" ADD CONSTRAINT "homepage_blocks_product_usage_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_product_usage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_usage" ADD CONSTRAINT "homepage_blocks_product_usage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_about_us" ADD CONSTRAINT "homepage_blocks_about_us_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_about_us" ADD CONSTRAINT "homepage_blocks_about_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_carousel_slides" ADD CONSTRAINT "_homepage_v_blocks_hero_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_carousel_slides" ADD CONSTRAINT "_homepage_v_blocks_hero_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_hero_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero_carousel" ADD CONSTRAINT "_homepage_v_blocks_hero_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_carousel" ADD CONSTRAINT "_homepage_v_blocks_product_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_category_banner" ADD CONSTRAINT "_homepage_v_blocks_category_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_brand_story_links" ADD CONSTRAINT "_homepage_v_blocks_brand_story_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_brand_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_brand_story" ADD CONSTRAINT "_homepage_v_blocks_brand_story_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_brand_story" ADD CONSTRAINT "_homepage_v_blocks_brand_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_feature_circles_features" ADD CONSTRAINT "_homepage_v_blocks_feature_circles_features_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_feature_circles_features" ADD CONSTRAINT "_homepage_v_blocks_feature_circles_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_feature_circles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_feature_circles" ADD CONSTRAINT "_homepage_v_blocks_feature_circles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_media_mentions_outlets" ADD CONSTRAINT "_homepage_v_blocks_media_mentions_outlets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_media_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_media_mentions" ADD CONSTRAINT "_homepage_v_blocks_media_mentions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_partner_logos_partners" ADD CONSTRAINT "_homepage_v_blocks_partner_logos_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_partner_logos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_partner_logos" ADD CONSTRAINT "_homepage_v_blocks_partner_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_customer_reviews_reviews" ADD CONSTRAINT "_homepage_v_blocks_customer_reviews_reviews_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_customer_reviews_reviews" ADD CONSTRAINT "_homepage_v_blocks_customer_reviews_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_customer_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_customer_reviews" ADD CONSTRAINT "_homepage_v_blocks_customer_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_usage_items" ADD CONSTRAINT "_homepage_v_blocks_product_usage_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_usage_items" ADD CONSTRAINT "_homepage_v_blocks_product_usage_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_product_usage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_usage" ADD CONSTRAINT "_homepage_v_blocks_product_usage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_about_us" ADD CONSTRAINT "_homepage_v_blocks_about_us_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_about_us" ADD CONSTRAINT "_homepage_v_blocks_about_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_blocks_hero_carousel_slides_order_idx" ON "homepage_blocks_hero_carousel_slides" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_carousel_slides_parent_id_idx" ON "homepage_blocks_hero_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_carousel_slides_image_idx" ON "homepage_blocks_hero_carousel_slides" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_hero_carousel_order_idx" ON "homepage_blocks_hero_carousel" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_carousel_parent_id_idx" ON "homepage_blocks_hero_carousel" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_carousel_path_idx" ON "homepage_blocks_hero_carousel" USING btree ("_path");
  CREATE INDEX "homepage_blocks_product_carousel_order_idx" ON "homepage_blocks_product_carousel" USING btree ("_order");
  CREATE INDEX "homepage_blocks_product_carousel_parent_id_idx" ON "homepage_blocks_product_carousel" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_product_carousel_path_idx" ON "homepage_blocks_product_carousel" USING btree ("_path");
  CREATE INDEX "homepage_blocks_category_banner_order_idx" ON "homepage_blocks_category_banner" USING btree ("_order");
  CREATE INDEX "homepage_blocks_category_banner_parent_id_idx" ON "homepage_blocks_category_banner" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_category_banner_path_idx" ON "homepage_blocks_category_banner" USING btree ("_path");
  CREATE INDEX "homepage_blocks_brand_story_links_order_idx" ON "homepage_blocks_brand_story_links" USING btree ("_order");
  CREATE INDEX "homepage_blocks_brand_story_links_parent_id_idx" ON "homepage_blocks_brand_story_links" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_brand_story_order_idx" ON "homepage_blocks_brand_story" USING btree ("_order");
  CREATE INDEX "homepage_blocks_brand_story_parent_id_idx" ON "homepage_blocks_brand_story" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_brand_story_path_idx" ON "homepage_blocks_brand_story" USING btree ("_path");
  CREATE INDEX "homepage_blocks_brand_story_background_image_idx" ON "homepage_blocks_brand_story" USING btree ("background_image_id");
  CREATE INDEX "homepage_blocks_feature_circles_features_order_idx" ON "homepage_blocks_feature_circles_features" USING btree ("_order");
  CREATE INDEX "homepage_blocks_feature_circles_features_parent_id_idx" ON "homepage_blocks_feature_circles_features" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_feature_circles_features_image_idx" ON "homepage_blocks_feature_circles_features" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_feature_circles_order_idx" ON "homepage_blocks_feature_circles" USING btree ("_order");
  CREATE INDEX "homepage_blocks_feature_circles_parent_id_idx" ON "homepage_blocks_feature_circles" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_feature_circles_path_idx" ON "homepage_blocks_feature_circles" USING btree ("_path");
  CREATE INDEX "homepage_blocks_media_mentions_outlets_order_idx" ON "homepage_blocks_media_mentions_outlets" USING btree ("_order");
  CREATE INDEX "homepage_blocks_media_mentions_outlets_parent_id_idx" ON "homepage_blocks_media_mentions_outlets" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_media_mentions_order_idx" ON "homepage_blocks_media_mentions" USING btree ("_order");
  CREATE INDEX "homepage_blocks_media_mentions_parent_id_idx" ON "homepage_blocks_media_mentions" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_media_mentions_path_idx" ON "homepage_blocks_media_mentions" USING btree ("_path");
  CREATE INDEX "homepage_blocks_partner_logos_partners_order_idx" ON "homepage_blocks_partner_logos_partners" USING btree ("_order");
  CREATE INDEX "homepage_blocks_partner_logos_partners_parent_id_idx" ON "homepage_blocks_partner_logos_partners" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_partner_logos_order_idx" ON "homepage_blocks_partner_logos" USING btree ("_order");
  CREATE INDEX "homepage_blocks_partner_logos_parent_id_idx" ON "homepage_blocks_partner_logos" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_partner_logos_path_idx" ON "homepage_blocks_partner_logos" USING btree ("_path");
  CREATE INDEX "homepage_blocks_customer_reviews_reviews_order_idx" ON "homepage_blocks_customer_reviews_reviews" USING btree ("_order");
  CREATE INDEX "homepage_blocks_customer_reviews_reviews_parent_id_idx" ON "homepage_blocks_customer_reviews_reviews" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_customer_reviews_reviews_image_idx" ON "homepage_blocks_customer_reviews_reviews" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_customer_reviews_order_idx" ON "homepage_blocks_customer_reviews" USING btree ("_order");
  CREATE INDEX "homepage_blocks_customer_reviews_parent_id_idx" ON "homepage_blocks_customer_reviews" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_customer_reviews_path_idx" ON "homepage_blocks_customer_reviews" USING btree ("_path");
  CREATE INDEX "homepage_blocks_product_usage_items_order_idx" ON "homepage_blocks_product_usage_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_product_usage_items_parent_id_idx" ON "homepage_blocks_product_usage_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_product_usage_items_image_idx" ON "homepage_blocks_product_usage_items" USING btree ("image_id");
  CREATE INDEX "homepage_blocks_product_usage_order_idx" ON "homepage_blocks_product_usage" USING btree ("_order");
  CREATE INDEX "homepage_blocks_product_usage_parent_id_idx" ON "homepage_blocks_product_usage" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_product_usage_path_idx" ON "homepage_blocks_product_usage" USING btree ("_path");
  CREATE INDEX "homepage_blocks_about_us_order_idx" ON "homepage_blocks_about_us" USING btree ("_order");
  CREATE INDEX "homepage_blocks_about_us_parent_id_idx" ON "homepage_blocks_about_us" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_about_us_path_idx" ON "homepage_blocks_about_us" USING btree ("_path");
  CREATE INDEX "homepage_blocks_about_us_image_idx" ON "homepage_blocks_about_us" USING btree ("image_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_categories_id_idx" ON "homepage_rels" USING btree ("categories_id");
  CREATE INDEX "homepage_rels_products_id_idx" ON "homepage_rels" USING btree ("products_id");
  CREATE INDEX "homepage_rels_pages_id_idx" ON "homepage_rels" USING btree ("pages_id");
  CREATE INDEX "_homepage_v_blocks_hero_carousel_slides_order_idx" ON "_homepage_v_blocks_hero_carousel_slides" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_carousel_slides_parent_id_idx" ON "_homepage_v_blocks_hero_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_carousel_slides_image_idx" ON "_homepage_v_blocks_hero_carousel_slides" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_hero_carousel_order_idx" ON "_homepage_v_blocks_hero_carousel" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_carousel_parent_id_idx" ON "_homepage_v_blocks_hero_carousel" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_carousel_path_idx" ON "_homepage_v_blocks_hero_carousel" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_product_carousel_order_idx" ON "_homepage_v_blocks_product_carousel" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_product_carousel_parent_id_idx" ON "_homepage_v_blocks_product_carousel" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_product_carousel_path_idx" ON "_homepage_v_blocks_product_carousel" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_category_banner_order_idx" ON "_homepage_v_blocks_category_banner" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_category_banner_parent_id_idx" ON "_homepage_v_blocks_category_banner" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_category_banner_path_idx" ON "_homepage_v_blocks_category_banner" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_brand_story_links_order_idx" ON "_homepage_v_blocks_brand_story_links" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_brand_story_links_parent_id_idx" ON "_homepage_v_blocks_brand_story_links" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_brand_story_order_idx" ON "_homepage_v_blocks_brand_story" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_brand_story_parent_id_idx" ON "_homepage_v_blocks_brand_story" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_brand_story_path_idx" ON "_homepage_v_blocks_brand_story" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_brand_story_background_image_idx" ON "_homepage_v_blocks_brand_story" USING btree ("background_image_id");
  CREATE INDEX "_homepage_v_blocks_feature_circles_features_order_idx" ON "_homepage_v_blocks_feature_circles_features" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_feature_circles_features_parent_id_idx" ON "_homepage_v_blocks_feature_circles_features" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_feature_circles_features_image_idx" ON "_homepage_v_blocks_feature_circles_features" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_feature_circles_order_idx" ON "_homepage_v_blocks_feature_circles" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_feature_circles_parent_id_idx" ON "_homepage_v_blocks_feature_circles" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_feature_circles_path_idx" ON "_homepage_v_blocks_feature_circles" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_media_mentions_outlets_order_idx" ON "_homepage_v_blocks_media_mentions_outlets" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_media_mentions_outlets_parent_id_idx" ON "_homepage_v_blocks_media_mentions_outlets" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_media_mentions_order_idx" ON "_homepage_v_blocks_media_mentions" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_media_mentions_parent_id_idx" ON "_homepage_v_blocks_media_mentions" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_media_mentions_path_idx" ON "_homepage_v_blocks_media_mentions" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_partner_logos_partners_order_idx" ON "_homepage_v_blocks_partner_logos_partners" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_partner_logos_partners_parent_id_idx" ON "_homepage_v_blocks_partner_logos_partners" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_partner_logos_order_idx" ON "_homepage_v_blocks_partner_logos" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_partner_logos_parent_id_idx" ON "_homepage_v_blocks_partner_logos" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_partner_logos_path_idx" ON "_homepage_v_blocks_partner_logos" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_customer_reviews_reviews_order_idx" ON "_homepage_v_blocks_customer_reviews_reviews" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_customer_reviews_reviews_parent_id_idx" ON "_homepage_v_blocks_customer_reviews_reviews" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_customer_reviews_reviews_image_idx" ON "_homepage_v_blocks_customer_reviews_reviews" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_customer_reviews_order_idx" ON "_homepage_v_blocks_customer_reviews" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_customer_reviews_parent_id_idx" ON "_homepage_v_blocks_customer_reviews" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_customer_reviews_path_idx" ON "_homepage_v_blocks_customer_reviews" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_product_usage_items_order_idx" ON "_homepage_v_blocks_product_usage_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_product_usage_items_parent_id_idx" ON "_homepage_v_blocks_product_usage_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_product_usage_items_image_idx" ON "_homepage_v_blocks_product_usage_items" USING btree ("image_id");
  CREATE INDEX "_homepage_v_blocks_product_usage_order_idx" ON "_homepage_v_blocks_product_usage" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_product_usage_parent_id_idx" ON "_homepage_v_blocks_product_usage" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_product_usage_path_idx" ON "_homepage_v_blocks_product_usage" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_about_us_order_idx" ON "_homepage_v_blocks_about_us" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_about_us_parent_id_idx" ON "_homepage_v_blocks_about_us" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_about_us_path_idx" ON "_homepage_v_blocks_about_us" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_about_us_image_idx" ON "_homepage_v_blocks_about_us" USING btree ("image_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "_homepage_v_autosave_idx" ON "_homepage_v" USING btree ("autosave");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_categories_id_idx" ON "_homepage_v_rels" USING btree ("categories_id");
  CREATE INDEX "_homepage_v_rels_products_id_idx" ON "_homepage_v_rels" USING btree ("products_id");
  CREATE INDEX "_homepage_v_rels_pages_id_idx" ON "_homepage_v_rels" USING btree ("pages_id");
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_blocks_hero_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_hero_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_product_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_category_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_brand_story_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_brand_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_feature_circles_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_feature_circles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_media_mentions_outlets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_media_mentions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_partner_logos_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_partner_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_customer_reviews_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_customer_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_product_usage_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_product_usage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_blocks_about_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_hero_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_hero_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_product_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_category_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_brand_story_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_brand_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_feature_circles_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_feature_circles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_media_mentions_outlets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_media_mentions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_partner_logos_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_partner_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_customer_reviews_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_customer_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_product_usage_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_product_usage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_blocks_about_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_blocks_hero_carousel_slides" CASCADE;
  DROP TABLE "homepage_blocks_hero_carousel" CASCADE;
  DROP TABLE "homepage_blocks_product_carousel" CASCADE;
  DROP TABLE "homepage_blocks_category_banner" CASCADE;
  DROP TABLE "homepage_blocks_brand_story_links" CASCADE;
  DROP TABLE "homepage_blocks_brand_story" CASCADE;
  DROP TABLE "homepage_blocks_feature_circles_features" CASCADE;
  DROP TABLE "homepage_blocks_feature_circles" CASCADE;
  DROP TABLE "homepage_blocks_media_mentions_outlets" CASCADE;
  DROP TABLE "homepage_blocks_media_mentions" CASCADE;
  DROP TABLE "homepage_blocks_partner_logos_partners" CASCADE;
  DROP TABLE "homepage_blocks_partner_logos" CASCADE;
  DROP TABLE "homepage_blocks_customer_reviews_reviews" CASCADE;
  DROP TABLE "homepage_blocks_customer_reviews" CASCADE;
  DROP TABLE "homepage_blocks_product_usage_items" CASCADE;
  DROP TABLE "homepage_blocks_product_usage" CASCADE;
  DROP TABLE "homepage_blocks_about_us" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_carousel_slides" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero_carousel" CASCADE;
  DROP TABLE "_homepage_v_blocks_product_carousel" CASCADE;
  DROP TABLE "_homepage_v_blocks_category_banner" CASCADE;
  DROP TABLE "_homepage_v_blocks_brand_story_links" CASCADE;
  DROP TABLE "_homepage_v_blocks_brand_story" CASCADE;
  DROP TABLE "_homepage_v_blocks_feature_circles_features" CASCADE;
  DROP TABLE "_homepage_v_blocks_feature_circles" CASCADE;
  DROP TABLE "_homepage_v_blocks_media_mentions_outlets" CASCADE;
  DROP TABLE "_homepage_v_blocks_media_mentions" CASCADE;
  DROP TABLE "_homepage_v_blocks_partner_logos_partners" CASCADE;
  DROP TABLE "_homepage_v_blocks_partner_logos" CASCADE;
  DROP TABLE "_homepage_v_blocks_customer_reviews_reviews" CASCADE;
  DROP TABLE "_homepage_v_blocks_customer_reviews" CASCADE;
  DROP TABLE "_homepage_v_blocks_product_usage_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_product_usage" CASCADE;
  DROP TABLE "_homepage_v_blocks_about_us" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  
  DROP INDEX "categories_parent_idx";
  ALTER TABLE "categories" DROP COLUMN "parent_id";
  DROP TYPE "public"."enum_homepage_blocks_product_carousel_populate_by";
  DROP TYPE "public"."enum_homepage_blocks_product_carousel_sort";
  DROP TYPE "public"."enum_homepage_blocks_category_banner_populate_by";
  DROP TYPE "public"."enum_homepage_blocks_category_banner_sort";
  DROP TYPE "public"."enum_homepage_blocks_brand_story_links_link_type";
  DROP TYPE "public"."enum_homepage_blocks_brand_story_links_link_appearance";
  DROP TYPE "public"."enum_homepage_blocks_feature_circles_background_color";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_blocks_product_carousel_populate_by";
  DROP TYPE "public"."enum__homepage_v_blocks_product_carousel_sort";
  DROP TYPE "public"."enum__homepage_v_blocks_category_banner_populate_by";
  DROP TYPE "public"."enum__homepage_v_blocks_category_banner_sort";
  DROP TYPE "public"."enum__homepage_v_blocks_brand_story_links_link_type";
  DROP TYPE "public"."enum__homepage_v_blocks_brand_story_links_link_appearance";
  DROP TYPE "public"."enum__homepage_v_blocks_feature_circles_background_color";
  DROP TYPE "public"."enum__homepage_v_version_status";`)
}
