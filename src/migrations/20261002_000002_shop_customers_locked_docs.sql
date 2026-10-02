-- Hotfix: Payload admin requires customers_id on locked-documents rels
-- after adding the Shop Customers collection. Without this column, /admin 500s.
-- Safe to re-run.

BEGIN;

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

COMMIT;
