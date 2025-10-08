-- Add clothing options field to order_items table
-- This stores color, size, and other clothing-specific options

-- Add options column as JSONB to store clothing configuration
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS options JSONB;

-- Add comment to clarify the purpose of this field
COMMENT ON COLUMN order_items.options IS 'JSON object storing clothing options like color, size, etc. Example: {"color": "Black", "size": "M"}';

-- Update the CHECK constraint for selected_product_type to include 'clothing'
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_selected_product_type_check;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_selected_product_type_check 
CHECK (selected_product_type IN ('digital', 'poster', 'clothing'));

-- Create index for faster filtering by options
CREATE INDEX IF NOT EXISTS idx_order_items_options ON order_items USING GIN (options);

-- Update any existing clothing items to have the correct product type
UPDATE order_items 
SET selected_product_type = 'clothing' 
WHERE selected_product_type = 'digital' 
  AND (
    product_title ILIKE '%sweatshirt%' OR
    product_title ILIKE '%hoodie%' OR
    product_title ILIKE '%t-shirt%' OR
    product_title ILIKE '%shirt%' OR
    product_title ILIKE '%jacket%' OR
    product_title ILIKE '%sweater%' OR
    product_title ILIKE '%crewneck%' OR
    product_title ILIKE '%oversized%'
  );

-- Verify the changes
SELECT 
    id,
    product_title,
    selected_product_type,
    selected_poster_size,
    options
FROM order_items 
WHERE selected_product_type = 'clothing'
ORDER BY id DESC 
LIMIT 10;
