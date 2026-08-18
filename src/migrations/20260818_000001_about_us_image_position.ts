import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_homepage_blocks_about_us_image_position'
      ) THEN
        CREATE TYPE "public"."enum_homepage_blocks_about_us_image_position"
          AS ENUM ('imageLeft', 'imageRight');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum__homepage_v_blocks_about_us_image_position'
      ) THEN
        CREATE TYPE "public"."enum__homepage_v_blocks_about_us_image_position"
          AS ENUM ('imageLeft', 'imageRight');
      END IF;
    END $$;

    ALTER TABLE "homepage_blocks_about_us"
      ADD COLUMN IF NOT EXISTS "image_position" "enum_homepage_blocks_about_us_image_position"
      DEFAULT 'imageLeft';

    ALTER TABLE "_homepage_v_blocks_about_us"
      ADD COLUMN IF NOT EXISTS "image_position" "enum__homepage_v_blocks_about_us_image_position"
      DEFAULT 'imageLeft';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_blocks_about_us"
      DROP COLUMN IF EXISTS "image_position";
    ALTER TABLE "_homepage_v_blocks_about_us"
      DROP COLUMN IF EXISTS "image_position";
    DROP TYPE IF EXISTS "public"."enum_homepage_blocks_about_us_image_position";
    DROP TYPE IF EXISTS "public"."enum__homepage_v_blocks_about_us_image_position";
  `)
}
