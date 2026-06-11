import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "variants" ADD COLUMN "compare_at_price_in_e_u_r" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_compare_at_price_in_e_u_r" numeric;
  ALTER TABLE "products" ADD COLUMN "compare_at_price_in_e_u_r" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_compare_at_price_in_e_u_r" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "variants" DROP COLUMN "compare_at_price_in_e_u_r";
  ALTER TABLE "_variants_v" DROP COLUMN "version_compare_at_price_in_e_u_r";
  ALTER TABLE "products" DROP COLUMN "compare_at_price_in_e_u_r";
  ALTER TABLE "_products_v" DROP COLUMN "version_compare_at_price_in_e_u_r";`)
}
