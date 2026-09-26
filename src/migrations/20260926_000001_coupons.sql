-- Coupons: percentage promo codes + fixed € vouchers (cents).
-- Also adds applied-coupon snapshot fields on carts and orders.
-- Safe to re-run. Apply on Neon (payload-neon) before/with deploy.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_coupons_type') THEN
    CREATE TYPE "public"."enum_coupons_type" AS ENUM ('percentage', 'fixed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "coupons" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" varchar NOT NULL,
  "type" "enum_coupons_type" DEFAULT 'percentage' NOT NULL,
  "value" numeric NOT NULL,
  "enabled" boolean DEFAULT true,
  "starts_at" timestamp(3) with time zone,
  "ends_at" timestamp(3) with time zone,
  "usage_limit" numeric,
  "usage_count" numeric DEFAULT 0,
  "per_customer_limit" numeric,
  "min_order_cents" numeric,
  "note" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" USING btree ("code");
CREATE INDEX IF NOT EXISTS "coupons_updated_at_idx" ON "coupons" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "coupons_created_at_idx" ON "coupons" USING btree ("created_at");

ALTER TABLE "carts"
  ADD COLUMN IF NOT EXISTS "applied_coupon_id" integer,
  ADD COLUMN IF NOT EXISTS "coupon_code" varchar,
  ADD COLUMN IF NOT EXISTS "coupon_discount_cents" numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "coupon_type" varchar,
  ADD COLUMN IF NOT EXISTS "coupon_value" numeric;

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "applied_coupon_id" integer,
  ADD COLUMN IF NOT EXISTS "coupon_code" varchar,
  ADD COLUMN IF NOT EXISTS "coupon_discount_cents" numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "coupon_type" varchar,
  ADD COLUMN IF NOT EXISTS "coupon_value" numeric;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'carts_applied_coupon_id_coupons_id_fk'
  ) THEN
    ALTER TABLE "carts"
      ADD CONSTRAINT "carts_applied_coupon_id_coupons_id_fk"
      FOREIGN KEY ("applied_coupon_id") REFERENCES "public"."coupons"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_applied_coupon_id_coupons_id_fk'
  ) THEN
    ALTER TABLE "orders"
      ADD CONSTRAINT "orders_applied_coupon_id_coupons_id_fk"
      FOREIGN KEY ("applied_coupon_id") REFERENCES "public"."coupons"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "carts_applied_coupon_idx" ON "carts" USING btree ("applied_coupon_id");
CREATE INDEX IF NOT EXISTS "orders_applied_coupon_idx" ON "orders" USING btree ("applied_coupon_id");
CREATE INDEX IF NOT EXISTS "orders_coupon_code_idx" ON "orders" USING btree ("coupon_code");

ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "coupons_id" integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_coupons_fk'
  ) THEN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk"
      FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_coupons_id_idx"
  ON "payload_locked_documents_rels" USING btree ("coupons_id");
