import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "brand_logo_name" varchar;
  ALTER TABLE "homepage_blocks_about_us" ADD COLUMN "learn_more_label" varchar DEFAULT 'Learn More';
  ALTER TABLE "homepage_blocks_about_us" ADD COLUMN "learn_more_url" varchar DEFAULT '/shop';
  ALTER TABLE "_homepage_v_blocks_about_us" ADD COLUMN "learn_more_label" varchar DEFAULT 'Learn More';
  ALTER TABLE "_homepage_v_blocks_about_us" ADD COLUMN "learn_more_url" varchar DEFAULT '/shop';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP COLUMN "brand_logo_name";
  ALTER TABLE "homepage_blocks_about_us" DROP COLUMN "learn_more_label";
  ALTER TABLE "homepage_blocks_about_us" DROP COLUMN "learn_more_url";
  ALTER TABLE "_homepage_v_blocks_about_us" DROP COLUMN "learn_more_label";
  ALTER TABLE "_homepage_v_blocks_about_us" DROP COLUMN "learn_more_url";`)
}
