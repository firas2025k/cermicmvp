import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Content block text alignment (left / center / right).
 * Standalone SQL: src/migrations/20260927_000004_content_alignment.sql
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_pages_blocks_content_alignment'
      ) THEN
        CREATE TYPE "public"."enum_pages_blocks_content_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_blocks_content_alignment'
      ) THEN
        CREATE TYPE "public"."enum__pages_v_blocks_content_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_products_blocks_content_alignment'
      ) THEN
        CREATE TYPE "public"."enum_products_blocks_content_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum__products_v_blocks_content_alignment'
      ) THEN
        CREATE TYPE "public"."enum__products_v_blocks_content_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "pages_blocks_content"
      ADD COLUMN IF NOT EXISTS "alignment" "enum_pages_blocks_content_alignment" DEFAULT 'left';

    ALTER TABLE "_pages_v_blocks_content"
      ADD COLUMN IF NOT EXISTS "alignment" "enum__pages_v_blocks_content_alignment" DEFAULT 'left';

    ALTER TABLE "products_blocks_content"
      ADD COLUMN IF NOT EXISTS "alignment" "enum_products_blocks_content_alignment" DEFAULT 'left';

    ALTER TABLE "_products_v_blocks_content"
      ADD COLUMN IF NOT EXISTS "alignment" "enum__products_v_blocks_content_alignment" DEFAULT 'left';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_content" DROP COLUMN IF EXISTS "alignment";
    ALTER TABLE "_pages_v_blocks_content" DROP COLUMN IF EXISTS "alignment";
    ALTER TABLE "products_blocks_content" DROP COLUMN IF EXISTS "alignment";
    ALTER TABLE "_products_v_blocks_content" DROP COLUMN IF EXISTS "alignment";

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_content_alignment";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_content_alignment";
    DROP TYPE IF EXISTS "public"."enum_products_blocks_content_alignment";
    DROP TYPE IF EXISTS "public"."enum__products_v_blocks_content_alignment";
  `)
}
