import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const col = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'order'
  `)
  if (col.rows.length === 0) {
    await db.execute(sql`
      ALTER TABLE "categories" ADD COLUMN "order" integer;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "order";
  `)
}
