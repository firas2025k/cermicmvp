import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Dual Image Story homepage block (title + 70/30 images + description).
 * Standalone SQL: src/migrations/20260927_000001_dual_image_story.sql
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "homepage_blocks_dual_image_story" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar DEFAULT 'NABEA VOR ORT ENTDECKEN',
      "left_image_id" integer,
      "right_image_id" integer,
      "left_width_percent" numeric DEFAULT 70,
      "description" varchar,
      "block_name" varchar
    );

    CREATE TABLE IF NOT EXISTS "_homepage_v_blocks_dual_image_story" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "_path" text NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar DEFAULT 'NABEA VOR ORT ENTDECKEN',
      "left_image_id" integer,
      "right_image_id" integer,
      "left_width_percent" numeric DEFAULT 70,
      "description" varchar,
      "_uuid" varchar,
      "block_name" varchar
    );
  `)

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'homepage_blocks_dual_image_story_left_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "homepage_blocks_dual_image_story"
          ADD CONSTRAINT "homepage_blocks_dual_image_story_left_image_id_media_id_fk"
          FOREIGN KEY ("left_image_id") REFERENCES "public"."media"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'homepage_blocks_dual_image_story_right_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "homepage_blocks_dual_image_story"
          ADD CONSTRAINT "homepage_blocks_dual_image_story_right_image_id_media_id_fk"
          FOREIGN KEY ("right_image_id") REFERENCES "public"."media"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'homepage_blocks_dual_image_story_parent_id_fk'
      ) THEN
        ALTER TABLE "homepage_blocks_dual_image_story"
          ADD CONSTRAINT "homepage_blocks_dual_image_story_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_homepage_v_blocks_dual_image_story_left_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "_homepage_v_blocks_dual_image_story"
          ADD CONSTRAINT "_homepage_v_blocks_dual_image_story_left_image_id_media_id_fk"
          FOREIGN KEY ("left_image_id") REFERENCES "public"."media"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_homepage_v_blocks_dual_image_story_right_image_id_media_id_fk'
      ) THEN
        ALTER TABLE "_homepage_v_blocks_dual_image_story"
          ADD CONSTRAINT "_homepage_v_blocks_dual_image_story_right_image_id_media_id_fk"
          FOREIGN KEY ("right_image_id") REFERENCES "public"."media"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '_homepage_v_blocks_dual_image_story_parent_id_fk'
      ) THEN
        ALTER TABLE "_homepage_v_blocks_dual_image_story"
          ADD CONSTRAINT "_homepage_v_blocks_dual_image_story_parent_id_fk"
          FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
      END IF;
    END $$;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "homepage_blocks_dual_image_story_order_idx"
      ON "homepage_blocks_dual_image_story" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "homepage_blocks_dual_image_story_parent_id_idx"
      ON "homepage_blocks_dual_image_story" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "homepage_blocks_dual_image_story_path_idx"
      ON "homepage_blocks_dual_image_story" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "homepage_blocks_dual_image_story_left_image_idx"
      ON "homepage_blocks_dual_image_story" USING btree ("left_image_id");
    CREATE INDEX IF NOT EXISTS "homepage_blocks_dual_image_story_right_image_idx"
      ON "homepage_blocks_dual_image_story" USING btree ("right_image_id");

    CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_dual_image_story_order_idx"
      ON "_homepage_v_blocks_dual_image_story" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_dual_image_story_parent_id_idx"
      ON "_homepage_v_blocks_dual_image_story" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_dual_image_story_path_idx"
      ON "_homepage_v_blocks_dual_image_story" USING btree ("_path");
    CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_dual_image_story_left_image_idx"
      ON "_homepage_v_blocks_dual_image_story" USING btree ("left_image_id");
    CREATE INDEX IF NOT EXISTS "_homepage_v_blocks_dual_image_story_right_image_idx"
      ON "_homepage_v_blocks_dual_image_story" USING btree ("right_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_homepage_v_blocks_dual_image_story" CASCADE;
    DROP TABLE IF EXISTS "homepage_blocks_dual_image_story" CASCADE;
  `)
}
