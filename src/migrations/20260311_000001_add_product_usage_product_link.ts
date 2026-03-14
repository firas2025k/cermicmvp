import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add link_type and product_id to homepage_blocks_product_usage_items
  const cols = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'homepage_blocks_product_usage_items' AND column_name = 'link_type'
  `)

  if (cols.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "homepage_blocks_product_usage_items"
        ADD COLUMN "link_type" varchar DEFAULT 'custom';
      ALTER TABLE "homepage_blocks_product_usage_items"
        ADD COLUMN "product_id" integer;
    `)
    await db.execute(sql`
      ALTER TABLE "homepage_blocks_product_usage_items"
        DROP CONSTRAINT IF EXISTS "homepage_blocks_product_usage_items_product_id_products_id_fk";
      ALTER TABLE "homepage_blocks_product_usage_items"
        ADD CONSTRAINT "homepage_blocks_product_usage_items_product_id_products_id_fk"
        FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION;
      CREATE INDEX IF NOT EXISTS "homepage_blocks_product_usage_items_product_id_idx"
        ON "homepage_blocks_product_usage_items" USING btree ("product_id");
    `)
  }

  // Same for versions table
  const versionCols = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = '_homepage_v_blocks_product_usage_items' AND column_name = 'link_type'
  `)

  if (versionCols.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "_homepage_v_blocks_product_usage_items"
        ADD COLUMN "link_type" varchar DEFAULT 'custom';
      ALTER TABLE "_homepage_v_blocks_product_usage_items"
        ADD COLUMN "product_id" integer;
    `)
    await db.execute(sql`
      ALTER TABLE "_homepage_v_blocks_product_usage_items"
        DROP CONSTRAINT IF EXISTS "_homepage_v_blocks_product_usage_items_product_id_products_id_fk";
      ALTER TABLE "_homepage_v_blocks_product_usage_items"
        ADD CONSTRAINT "_homepage_v_blocks_product_usage_items_product_id_products_id_fk"
        FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION;
      CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_product_usage_items_product_id_idx"
        ON "_homepage_v_blocks_product_usage_items" USING btree ("product_id");
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_blocks_product_usage_items"
      DROP CONSTRAINT IF EXISTS "homepage_blocks_product_usage_items_product_id_products_id_fk";
    DROP INDEX IF EXISTS "homepage_blocks_product_usage_items_product_id_idx";
    ALTER TABLE "homepage_blocks_product_usage_items"
      DROP COLUMN IF EXISTS "link_type";
    ALTER TABLE "homepage_blocks_product_usage_items"
      DROP COLUMN IF EXISTS "product_id";
  `)

  await db.execute(sql`
    ALTER TABLE "_homepage_v_blocks_product_usage_items"
      DROP CONSTRAINT IF EXISTS "_homepage_v_blocks_product_usage_items_product_id_products_id_fk";
    DROP INDEX IF EXISTS "_homepage_v_blocks_product_usage_items_product_id_idx";
    ALTER TABLE "_homepage_v_blocks_product_usage_items"
      DROP COLUMN IF EXISTS "link_type";
    ALTER TABLE "_homepage_v_blocks_product_usage_items"
      DROP COLUMN IF EXISTS "product_id";
  `)
}
