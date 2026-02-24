import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add logo_image_id column if it doesn't exist
  const imageCol = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'header' AND column_name = 'logo_image_id'
  `)

  if (imageCol.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "header" ADD COLUMN "logo_image_id" integer;
      ALTER TABLE "header" ADD CONSTRAINT "header_logo_image_id_media_id_fk"
        FOREIGN KEY ("logo_image_id") REFERENCES "public"."media"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION;
      CREATE INDEX "header_logo_image_idx" ON "header" USING btree ("logo_image_id");
    `)
  }

  // Add logo_label column if it doesn't exist
  const labelCol = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'header' AND column_name = 'logo_label'
  `)

  if (labelCol.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "header" ADD COLUMN "logo_label" varchar;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "header" DROP CONSTRAINT IF EXISTS "header_logo_image_id_media_id_fk";
    DROP INDEX IF EXISTS "header_logo_image_idx";
    ALTER TABLE "header" DROP COLUMN IF EXISTS "logo_image_id";
    ALTER TABLE "header" DROP COLUMN IF EXISTS "logo_label";
  `)
}
