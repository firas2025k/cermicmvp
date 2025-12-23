-- Add parent_id column to categories table for subcategories support
-- This script safely checks if the column exists before adding it

DO $$ 
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'parent_id'
  ) THEN
    -- Add the parent_id column
    ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
    
    -- Add foreign key constraint
    ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" 
      FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") 
      ON DELETE set null ON UPDATE no action;
    
    -- Create index for better query performance
    CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
    
    RAISE NOTICE 'Successfully added parent_id column to categories table';
  ELSE
    RAISE NOTICE 'parent_id column already exists in categories table';
  END IF;
END $$;
