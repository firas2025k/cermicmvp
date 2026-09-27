import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Image + Text block for CMS Pages (image position + optional CTA).
 * Standalone SQL: src/migrations/20260927_000002_pages_image_text.sql
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_pages_blocks_image_text_image_position'
      ) THEN
        CREATE TYPE "public"."enum_pages_blocks_image_text_image_position"
          AS ENUM ('imageLeft', 'imageRight');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum__pages_v_blocks_image_text_image_position'
      ) THEN
        CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_position"
          AS ENUM ('imageLeft', 'imageRight');
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pages_blocks_image_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "image_id" integer,
      "image_position" "enum_pages_blocks_image_text_image_position" DEFAULT 'imageLeft',
      "content" jsonb,
      "cta_label" varchar,
      "cta_url" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_image_text" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "image_id" integer,
      "image_position" "enum__pages_v_blocks_image_text_image_position" DEFAULT 'imageLeft',
      "content" jsonb,
      "cta_label" varchar,
      "cta_url" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_image_text_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "pages_blocks_image_text"
          ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk"
          FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pages_blocks_image_text_parent_id_fk'
      ) THEN
        ALTER TABLE "pages_blocks_image_text"
          ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_image_text_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "_pages_v_blocks_image_text"
          ADD CONSTRAINT "_pages_v_blocks_image_text_image_id_media_id_fk"
          FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_pages_v_blocks_image_text_parent_id_fk'
      ) THEN
        ALTER TABLE "_pages_v_blocks_image_text"
          ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "pages_blocks_image_text_order_idx"
      ON "pages_blocks_image_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "pages_blocks_image_text_parent_id_idx"
      ON "pages_blocks_image_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "pages_blocks_image_text_path_idx"
      ON "pages_blocks_image_text" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "pages_blocks_image_text_image_idx"
      ON "pages_blocks_image_text" USING btree ("image_id");

    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_image_text_order_idx"
      ON "_pages_v_blocks_image_text" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_image_text_parent_id_idx"
      ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_image_text_path_idx"
      ON "_pages_v_blocks_image_text" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_image_text_image_idx"
      ON "_pages_v_blocks_image_text" USING btree ("image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_pages_v_blocks_image_text" CASCADE;
    DROP TABLE IF EXISTS "pages_blocks_image_text" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__pages_v_blocks_image_text_image_position";
    DROP TYPE IF EXISTS "public"."enum_pages_blocks_image_text_image_position";
  `)
}
