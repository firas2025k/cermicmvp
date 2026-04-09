import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TYPE "public"."enum_header_nav_items_link_type" ADD VALUE 'category';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  const col = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'header_nav_items' AND column_name = 'link_category_id'
  `)

  if (col.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "header_nav_items" ADD COLUMN "link_category_id" integer;
    `)
  }

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_category_id_categories_id_fk"
        FOREIGN KEY ("link_category_id") REFERENCES "public"."categories"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "header_nav_items_link_category_idx" ON "header_nav_items" USING btree ("link_category_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "header_nav_items_link_category_idx";
    ALTER TABLE "header_nav_items" DROP CONSTRAINT IF EXISTS "header_nav_items_link_category_id_categories_id_fk";
    ALTER TABLE "header_nav_items" DROP COLUMN IF EXISTS "link_category_id";
  `)
}
