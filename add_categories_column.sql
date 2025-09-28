-- Add categories column to products table for multiple category support
-- This migration adds support for storing multiple categories as a JSON array

-- Add categories column as JSONB to store array of category names
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single category data to categories array
UPDATE products 
SET categories = CASE 
  WHEN category IS NOT NULL AND category != '' THEN 
    jsonb_build_array(category)
  ELSE 
    '[]'::jsonb
END
WHERE categories IS NULL OR categories = '[]'::jsonb;

-- Add comment to clarify the purpose of this field
COMMENT ON COLUMN products.categories IS 'JSON array containing multiple category names (e.g., ["Digital Art", "Abstract", "Nature"])';

-- Create index for faster filtering by categories
CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN (categories);

-- Verify the migration worked by showing sample data
SELECT id, title, category, categories 
FROM products 
LIMIT 5;
