import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "variants" ADD COLUMN IF NOT EXISTS "sku" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "variants_sku_unique_idx"
      ON "variants" ("sku")
      WHERE "sku" IS NOT NULL;
  `)

  await db.execute(sql`
    ALTER TABLE "_variants_v" ADD COLUMN IF NOT EXISTS "version_sku" varchar;
    CREATE INDEX IF NOT EXISTS "_variants_v_version_sku_idx"
      ON "_variants_v" ("version_sku");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "_variants_v_version_sku_idx";
    ALTER TABLE "_variants_v" DROP COLUMN IF EXISTS "version_sku";
  `)

  await db.execute(sql`
    DROP INDEX IF EXISTS "variants_sku_unique_idx";
    ALTER TABLE "variants" DROP COLUMN IF EXISTS "sku";
  `)
}
