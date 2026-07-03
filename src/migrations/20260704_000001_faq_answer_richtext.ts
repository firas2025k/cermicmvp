import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Convert products_faq_items.answer from varchar to jsonb (richText)
  // Guard: only run if column is still varchar (idempotent)
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'products_faq_items'
          AND column_name = 'answer'
          AND data_type = 'character varying'
      ) THEN
        ALTER TABLE "products_faq_items" ADD COLUMN "answer_new" jsonb;

        UPDATE "products_faq_items"
        SET "answer_new" = jsonb_build_object(
          'root', jsonb_build_object(
            'type', 'root', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
            'children', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'type', 'paragraph', 'version', 1, 'format', '', 'indent', 0,
                  'direction', CASE WHEN trim(line) = '' THEN null ELSE 'ltr' END,
                  'textFormat', 0, 'textStyle', '',
                  'children', CASE
                    WHEN trim(line) = '' THEN '[]'::jsonb
                    ELSE jsonb_build_array(jsonb_build_object(
                      'type', 'text', 'version', 1, 'format', 0,
                      'style', '', 'mode', 'normal', 'detail', 0, 'text', line
                    ))
                  END
                )
              ) FROM unnest(string_to_array(answer, E'\n')) AS line
            )
          )
        );

        ALTER TABLE "products_faq_items" DROP COLUMN "answer";
        ALTER TABLE "products_faq_items" RENAME COLUMN "answer_new" TO "answer";
      END IF;
    END $$;
  `)

  // Same for versions table
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '_products_v_version_faq_items'
          AND column_name = 'answer'
          AND data_type = 'character varying'
      ) THEN
        ALTER TABLE "_products_v_version_faq_items" ADD COLUMN "answer_new" jsonb;

        UPDATE "_products_v_version_faq_items"
        SET "answer_new" = jsonb_build_object(
          'root', jsonb_build_object(
            'type', 'root', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
            'children', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'type', 'paragraph', 'version', 1, 'format', '', 'indent', 0,
                  'direction', CASE WHEN trim(line) = '' THEN null ELSE 'ltr' END,
                  'textFormat', 0, 'textStyle', '',
                  'children', CASE
                    WHEN trim(line) = '' THEN '[]'::jsonb
                    ELSE jsonb_build_array(jsonb_build_object(
                      'type', 'text', 'version', 1, 'format', 0,
                      'style', '', 'mode', 'normal', 'detail', 0, 'text', line
                    ))
                  END
                )
              ) FROM unnest(string_to_array(answer, E'\n')) AS line
            )
          )
        );

        ALTER TABLE "_products_v_version_faq_items" DROP COLUMN "answer";
        ALTER TABLE "_products_v_version_faq_items" RENAME COLUMN "answer_new" TO "answer";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products_faq_items" ALTER COLUMN "answer" TYPE varchar USING answer::text
  `)
  await db.execute(sql`
    ALTER TABLE "_products_v_version_faq_items" ALTER COLUMN "answer" TYPE varchar USING answer::text
  `)
}
