import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * CTA button alignment (left / center / right).
 * Standalone SQL: src/migrations/20260927_000005_cta_button_alignment.sql
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_pages_blocks_cta_button_alignment'
      ) THEN
        CREATE TYPE "public"."enum_pages_blocks_cta_button_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_blocks_cta_button_alignment'
      ) THEN
        CREATE TYPE "public"."enum__pages_v_blocks_cta_button_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_products_blocks_cta_button_alignment'
      ) THEN
        CREATE TYPE "public"."enum_products_blocks_cta_button_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum__products_v_blocks_cta_button_alignment'
      ) THEN
        CREATE TYPE "public"."enum__products_v_blocks_cta_button_alignment"
          AS ENUM ('left', 'center', 'right');
      END IF;
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "pages_blocks_cta"
      ADD COLUMN IF NOT EXISTS "button_alignment" "enum_pages_blocks_cta_button_alignment" DEFAULT 'right';

    ALTER TABLE "_pages_v_blocks_cta"
      ADD COLUMN IF NOT EXISTS "button_alignment" "enum__pages_v_blocks_cta_button_alignment" DEFAULT 'right';

    ALTER TABLE "products_blocks_cta"
      ADD COLUMN IF NOT EXISTS "button_alignment" "enum_products_blocks_cta_button_alignment" DEFAULT 'right';

    ALTER TABLE "_products_v_blocks_cta"
      ADD COLUMN IF NOT EXISTS "button_alignment" "enum__products_v_blocks_cta_button_alignment" DEFAULT 'right';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages_blocks_cta" DROP COLUMN IF EXISTS "button_alignment";
    ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN IF EXISTS "button_alignment";
    ALTER TABLE "products_blocks_cta" DROP COLUMN IF EXISTS "button_alignment";
    ALTER TABLE "_products_v_blocks_cta" DROP COLUMN IF EXISTS "button_alignment";

    DROP TYPE IF EXISTS "public"."enum_pages_blocks_cta_button_alignment";
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_cta_button_alignment";
    DROP TYPE IF EXISTS "public"."enum_products_blocks_cta_button_alignment";
    DROP TYPE IF EXISTS "public"."enum__products_v_blocks_cta_button_alignment";
  `)
}
