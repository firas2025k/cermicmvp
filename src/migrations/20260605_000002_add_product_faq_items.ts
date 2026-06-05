import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_faq_items" (
      "id" varchar PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "question" varchar,
      "answer" varchar,
      "_uuid" varchar
    )
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_faq_items_order_idx" ON "products_faq_items" ("_order")
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_faq_items_parent_id_idx" ON "products_faq_items" ("_parent_id")
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_products_v_version_faq_items" (
      "id" serial PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "_products_v"("id") ON DELETE CASCADE,
      "question" varchar,
      "answer" varchar,
      "_uuid" varchar
    )
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_products_v_version_faq_items_order_idx" ON "_products_v_version_faq_items" ("_order")
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "_products_v_version_faq_items_parent_id_idx" ON "_products_v_version_faq_items" ("_parent_id")
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "_products_v_version_faq_items"`)
  await db.execute(sql`DROP TABLE IF EXISTS "products_faq_items"`)
}
