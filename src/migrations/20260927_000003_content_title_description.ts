import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Optional title + description on Content blocks (Pages + Products).
 * Standalone SQL: src/migrations/20260927_000003_content_title_description.sql
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_content"
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar;

    ALTER TABLE "_pages_v_blocks_content"
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar;

    ALTER TABLE "products_blocks_content"
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar;

    ALTER TABLE "_products_v_blocks_content"
      ADD COLUMN IF NOT EXISTS "title" varchar,
      ADD COLUMN IF NOT EXISTS "description" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_content"
      DROP COLUMN IF EXISTS "title",
      DROP COLUMN IF EXISTS "description";

    ALTER TABLE "_pages_v_blocks_content"
      DROP COLUMN IF EXISTS "title",
      DROP COLUMN IF EXISTS "description";

    ALTER TABLE "products_blocks_content"
      DROP COLUMN IF EXISTS "title",
      DROP COLUMN IF EXISTS "description";

    ALTER TABLE "_products_v_blocks_content"
      DROP COLUMN IF EXISTS "title",
      DROP COLUMN IF EXISTS "description";
  `)
}
