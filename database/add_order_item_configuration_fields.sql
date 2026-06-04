-- Add configuration fields to order_items table
-- This stores the actual product configuration selected during checkout

-- Add selected_product_type column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS selected_product_type VARCHAR(20) DEFAULT 'digital' 
CHECK (selected_product_type IN ('digital', 'poster'));

-- Add selected_poster_size column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS selected_poster_size VARCHAR(50);

-- Add comments to clarify the purpose of these fields
COMMENT ON COLUMN order_items.selected_product_type IS 'The actual product type selected during checkout (digital or poster)';
COMMENT ON COLUMN order_items.selected_poster_size IS 'The actual poster size selected during checkout (e.g., A4, A3, 24x36)';

-- Create index for faster filtering by selected product type
CREATE INDEX IF NOT EXISTS idx_order_items_selected_product_type ON order_items(selected_product_type);

-- Update existing order items to have default values
UPDATE order_items 
SET selected_product_type = 'digital' 
WHERE selected_product_type IS NULL;

-- Verify the changes
SELECT 
    id,
    product_title,
    unit_price,
    selected_product_type,
    selected_poster_size
FROM order_items 
ORDER BY id DESC 
LIMIT 5;
