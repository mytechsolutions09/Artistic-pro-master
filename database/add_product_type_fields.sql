-- Add product type and poster size fields to products table
-- This migration adds support for distinguishing between digital and poster products

-- Add product_type column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'digital' CHECK (product_type IN ('digital', 'poster'));

-- Add poster_size column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS poster_size VARCHAR(50);

-- Add poster_pricing column for JSON data
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS poster_pricing JSONB;

-- Update existing products to be digital by default
UPDATE products 
SET product_type = 'digital' 
WHERE product_type IS NULL;

-- Add comment to clarify the purpose of these fields
COMMENT ON COLUMN products.product_type IS 'Type of product: digital (PDF + image files) or poster (physical product)';
COMMENT ON COLUMN products.poster_size IS 'Size specification for poster products (e.g., A4, A3, 24x36)';
COMMENT ON COLUMN products.poster_pricing IS 'JSON object containing pricing for each poster size (e.g., {"A4": 25, "A3": 35})';

-- Create index for faster filtering by product type
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);

-- Verify the changes by selecting a sample of products with new fields
SELECT id, title, product_type, poster_size, poster_pricing 
FROM products 
LIMIT 5;
