import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const cols = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'header' AND column_name = 'promotional_banner_enabled'
  `)

  if (cols.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "header" ADD COLUMN "promotional_banner_enabled" boolean DEFAULT true;
      ALTER TABLE "header" ADD COLUMN "promotional_banner_content" varchar DEFAULT 'Kostenloser Versand ab 50€ Bestellwert';
      ALTER TABLE "header" ADD COLUMN "promotional_banner_background_color" varchar DEFAULT '#991b1b';
      ALTER TABLE "header" ADD COLUMN "promotional_banner_text_color" varchar DEFAULT '#ffffff';
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "header" DROP COLUMN IF EXISTS "promotional_banner_enabled";
    ALTER TABLE "header" DROP COLUMN IF EXISTS "promotional_banner_content";
    ALTER TABLE "header" DROP COLUMN IF EXISTS "promotional_banner_background_color";
    ALTER TABLE "header" DROP COLUMN IF EXISTS "promotional_banner_text_color";
  `)
}
