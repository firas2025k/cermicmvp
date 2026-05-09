-- Creates the category_product_orders table used by the CategoryProductOrder collection.
-- Stores an explicit display position for a product within a specific category.

CREATE TABLE IF NOT EXISTS "category_product_orders" (
  "id"          serial PRIMARY KEY,
  "category_id" integer NOT NULL,
  "product_id"  integer NOT NULL,
  "position"    integer NOT NULL DEFAULT 999,
  "updated_at"  timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at"  timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- FK: category_id → categories
DO $$ BEGIN
  ALTER TABLE "category_product_orders"
    ADD CONSTRAINT "category_product_orders_category_id_categories_id_fk"
    FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- FK: product_id → products
DO $$ BEGIN
  ALTER TABLE "category_product_orders"
    ADD CONSTRAINT "category_product_orders_product_id_products_id_fk"
    FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Unique pair: one position entry per (category, product)
DO $$ BEGIN
  ALTER TABLE "category_product_orders"
    ADD CONSTRAINT "category_product_orders_category_product_unique"
    UNIQUE ("category_id", "product_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "category_product_orders_category_idx"
  ON "category_product_orders" USING btree ("category_id");

CREATE INDEX IF NOT EXISTS "category_product_orders_product_idx"
  ON "category_product_orders" USING btree ("product_id");

CREATE INDEX IF NOT EXISTS "category_product_orders_created_at_idx"
  ON "category_product_orders" USING btree ("created_at");

-- Payload tracks document locks for every collection via payload_locked_documents_rels.
-- We must add a column for this new collection so the admin dashboard can query it.
ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "category_product_orders_id" integer;

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_category_product_orders_fk"
    FOREIGN KEY ("category_product_orders_id")
    REFERENCES "public"."category_product_orders"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_category_product_orders_id_idx"
  ON "payload_locked_documents_rels" USING btree ("category_product_orders_id");
