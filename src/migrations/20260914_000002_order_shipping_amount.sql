-- Adds shipping_amount (cents) to orders for flat Versandkosten persistence.
-- Safe to re-run. Apply on Neon (payload-neon) before deploying the Orders field.

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "shipping_amount" numeric;
