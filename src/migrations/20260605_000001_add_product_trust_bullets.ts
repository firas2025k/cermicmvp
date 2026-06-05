import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_trust_bullets" (
      "id" varchar PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
      "label" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "products_trust_bullets_order_idx"
      ON "products_trust_bullets" ("_order");
    CREATE INDEX IF NOT EXISTS "products_trust_bullets_parent_id_idx"
      ON "products_trust_bullets" ("_parent_id");
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_products_v_version_trust_bullets" (
      "id" varchar PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "_products_v"("id") ON DELETE CASCADE,
      "label" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_products_v_version_trust_bullets_order_idx"
      ON "_products_v_version_trust_bullets" ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_version_trust_bullets_parent_id_idx"
      ON "_products_v_version_trust_bullets" ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_products_v_version_trust_bullets";
  `)

  await db.execute(sql`
    DROP TABLE IF EXISTS "products_trust_bullets";
  `)
}
