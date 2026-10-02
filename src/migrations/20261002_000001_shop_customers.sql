-- Shop Customers profiles + link from orders.
-- Display-only CRM for guest + account buyers (email + shipping). Does not replace users.
-- Run on Neon. Safe to re-run.

BEGIN;

CREATE TABLE IF NOT EXISTS "customers" (
  "id" serial PRIMARY KEY,
  "email" varchar NOT NULL,
  "display_name" varchar,
  "first_name" varchar,
  "last_name" varchar,
  "phone" varchar,
  "company" varchar,
  "shipping_address_address_line1" varchar,
  "shipping_address_address_line2" varchar,
  "shipping_address_city" varchar,
  "shipping_address_state" varchar,
  "shipping_address_postal_code" varchar,
  "shipping_address_country" varchar,
  "user_id" integer,
  "has_account" boolean DEFAULT false,
  "notes" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "customers"
    ADD CONSTRAINT "customers_email_unique" UNIQUE ("email");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "customers"
    ADD CONSTRAINT "customers_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_idx"
  ON "customers" USING btree ("email");

CREATE INDEX IF NOT EXISTS "customers_user_idx"
  ON "customers" USING btree ("user_id");

CREATE INDEX IF NOT EXISTS "customers_display_name_idx"
  ON "customers" USING btree ("display_name");

-- Link orders → customers
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "shop_customer_id" integer;

DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "orders_shop_customer_id_customers_id_fk"
    FOREIGN KEY ("shop_customer_id") REFERENCES "public"."customers"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "orders_shop_customer_idx"
  ON "orders" USING btree ("shop_customer_id");

-- Payload document locks (required for admin — missing this column 500s /admin)
ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "customers_id" integer;

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_customers_fk"
    FOREIGN KEY ("customers_id")
    REFERENCES "public"."customers"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customers_id_idx"
  ON "payload_locked_documents_rels" USING btree ("customers_id");

-- Backfill customers from distinct order emails (prefer latest order shipping).
INSERT INTO "customers" (
  "email",
  "display_name",
  "first_name",
  "last_name",
  "phone",
  "company",
  "shipping_address_address_line1",
  "shipping_address_address_line2",
  "shipping_address_city",
  "shipping_address_state",
  "shipping_address_postal_code",
  "shipping_address_country",
  "user_id",
  "has_account",
  "updated_at",
  "created_at"
)
SELECT
  lower(trim(src.email)) AS email,
  COALESCE(
    NULLIF(
      trim(
        concat_ws(
          ' ',
          NULLIF(trim(src.first_name), ''),
          NULLIF(trim(src.last_name), '')
        )
      ),
      ''
    ),
    lower(trim(src.email))
  ) AS display_name,
  NULLIF(trim(src.first_name), ''),
  NULLIF(trim(src.last_name), ''),
  NULLIF(trim(src.phone), ''),
  NULLIF(trim(src.company), ''),
  NULLIF(trim(src.address_line1), ''),
  NULLIF(trim(src.address_line2), ''),
  NULLIF(trim(src.city), ''),
  NULLIF(trim(src.state), ''),
  NULLIF(trim(src.postal_code), ''),
  NULLIF(trim(src.country), ''),
  src.user_id,
  (src.user_id IS NOT NULL) AS has_account,
  now(),
  now()
FROM (
  SELECT DISTINCT ON (lower(trim(o.customer_email)))
    o.customer_email AS email,
    o.shipping_address_first_name AS first_name,
    o.shipping_address_last_name AS last_name,
    o.shipping_address_phone AS phone,
    o.shipping_address_company AS company,
    o.shipping_address_address_line1 AS address_line1,
    o.shipping_address_address_line2 AS address_line2,
    o.shipping_address_city AS city,
    o.shipping_address_state AS state,
    o.shipping_address_postal_code AS postal_code,
    o.shipping_address_country AS country,
    o.customer_id AS user_id,
    o.created_at
  FROM "orders" o
  WHERE o.customer_email IS NOT NULL
    AND trim(o.customer_email) <> ''
  ORDER BY lower(trim(o.customer_email)), o.created_at DESC
) src
ON CONFLICT ("email") DO UPDATE SET
  "display_name" = EXCLUDED."display_name",
  "first_name" = EXCLUDED."first_name",
  "last_name" = EXCLUDED."last_name",
  "phone" = EXCLUDED."phone",
  "company" = EXCLUDED."company",
  "shipping_address_address_line1" = EXCLUDED."shipping_address_address_line1",
  "shipping_address_address_line2" = EXCLUDED."shipping_address_address_line2",
  "shipping_address_city" = EXCLUDED."shipping_address_city",
  "shipping_address_state" = EXCLUDED."shipping_address_state",
  "shipping_address_postal_code" = EXCLUDED."shipping_address_postal_code",
  "shipping_address_country" = EXCLUDED."shipping_address_country",
  "user_id" = COALESCE(EXCLUDED."user_id", "customers"."user_id"),
  "has_account" = COALESCE(EXCLUDED."has_account", "customers"."has_account"),
  "updated_at" = now();

-- Also create customers for orders that only have customer_id (no customer_email yet)
INSERT INTO "customers" (
  "email",
  "display_name",
  "first_name",
  "last_name",
  "phone",
  "company",
  "shipping_address_address_line1",
  "shipping_address_address_line2",
  "shipping_address_city",
  "shipping_address_state",
  "shipping_address_postal_code",
  "shipping_address_country",
  "user_id",
  "has_account",
  "updated_at",
  "created_at"
)
SELECT
  lower(trim(u.email)) AS email,
  COALESCE(
    NULLIF(
      trim(
        concat_ws(
          ' ',
          NULLIF(trim(o.shipping_address_first_name), ''),
          NULLIF(trim(o.shipping_address_last_name), '')
        )
      ),
      ''
    ),
    NULLIF(trim(u.name), ''),
    lower(trim(u.email))
  ) AS display_name,
  NULLIF(trim(o.shipping_address_first_name), ''),
  NULLIF(trim(o.shipping_address_last_name), ''),
  NULLIF(trim(o.shipping_address_phone), ''),
  NULLIF(trim(o.shipping_address_company), ''),
  NULLIF(trim(o.shipping_address_address_line1), ''),
  NULLIF(trim(o.shipping_address_address_line2), ''),
  NULLIF(trim(o.shipping_address_city), ''),
  NULLIF(trim(o.shipping_address_state), ''),
  NULLIF(trim(o.shipping_address_postal_code), ''),
  NULLIF(trim(o.shipping_address_country), ''),
  u.id,
  true,
  now(),
  now()
FROM "orders" o
JOIN "users" u ON u.id = o.customer_id
WHERE (o.customer_email IS NULL OR trim(o.customer_email) = '')
  AND u.email IS NOT NULL
  AND trim(u.email) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "customers" c WHERE c.email = lower(trim(u.email))
  )
ON CONFLICT ("email") DO NOTHING;

-- Backfill order.customer_email from linked user when empty
UPDATE "orders" o
SET "customer_email" = lower(trim(u.email)),
    "updated_at" = now()
FROM "users" u
WHERE o.customer_id = u.id
  AND (o.customer_email IS NULL OR trim(o.customer_email) = '')
  AND u.email IS NOT NULL
  AND trim(u.email) <> '';

-- Link orders to customers by email
UPDATE "orders" o
SET "shop_customer_id" = c.id,
    "updated_at" = now()
FROM "customers" c
WHERE o.shop_customer_id IS NULL
  AND o.customer_email IS NOT NULL
  AND lower(trim(o.customer_email)) = c.email;

COMMIT;
