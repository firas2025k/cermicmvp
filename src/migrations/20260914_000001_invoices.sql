-- Creates the invoices collection tables for Austrian Rechnungen (NABEA-YYYY-NNNN).
-- Run this directly on Neon. Safe to re-run (IF NOT EXISTS / duplicate_object guards).

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" serial PRIMARY KEY,
  "number" varchar NOT NULL,
  "order_id" integer,
  "customer_email" varchar,
  "issued_at" timestamp(3) with time zone,
  "currency" varchar DEFAULT 'EUR',
  "amount_gross" numeric,
  "amount_net" numeric,
  "amount_tax" numeric,
  "shipping_cents" numeric DEFAULT 0,
  "pdf_id" integer,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "invoices_line_items" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "title" varchar,
  "variant_title" varchar,
  "quantity" numeric,
  "unit_price_cents" numeric,
  "line_total_cents" numeric,
  "image_url" varchar
);

-- Unique invoice number (NABEA-2026-0001)
DO $$ BEGIN
  ALTER TABLE "invoices"
    ADD CONSTRAINT "invoices_number_unique" UNIQUE ("number");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- FK: order_id → orders
DO $$ BEGIN
  ALTER TABLE "invoices"
    ADD CONSTRAINT "invoices_order_id_orders_id_fk"
    FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- FK: pdf_id → media
DO $$ BEGIN
  ALTER TABLE "invoices"
    ADD CONSTRAINT "invoices_pdf_id_media_id_fk"
    FOREIGN KEY ("pdf_id") REFERENCES "public"."media"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- FK: line items parent
DO $$ BEGIN
  ALTER TABLE "invoices_line_items"
    ADD CONSTRAINT "invoices_line_items_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."invoices"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "invoices_number_idx"
  ON "invoices" USING btree ("number");

CREATE INDEX IF NOT EXISTS "invoices_order_idx"
  ON "invoices" USING btree ("order_id");

CREATE INDEX IF NOT EXISTS "invoices_pdf_idx"
  ON "invoices" USING btree ("pdf_id");

CREATE INDEX IF NOT EXISTS "invoices_issued_at_idx"
  ON "invoices" USING btree ("issued_at");

CREATE INDEX IF NOT EXISTS "invoices_updated_at_idx"
  ON "invoices" USING btree ("updated_at");

CREATE INDEX IF NOT EXISTS "invoices_created_at_idx"
  ON "invoices" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "invoices_line_items_order_idx"
  ON "invoices_line_items" USING btree ("_order");

CREATE INDEX IF NOT EXISTS "invoices_line_items_parent_id_idx"
  ON "invoices_line_items" USING btree ("_parent_id");

-- Payload document locks
ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "invoices_id" integer;

DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk"
    FOREIGN KEY ("invoices_id")
    REFERENCES "public"."invoices"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invoices_id_idx"
  ON "payload_locked_documents_rels" USING btree ("invoices_id");
