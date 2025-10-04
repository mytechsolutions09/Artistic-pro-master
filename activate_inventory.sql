-- =====================================================
-- ACTIVATE INVENTORY TRACKING SYSTEM
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to activate
-- inventory management for all products
-- =====================================================

-- Add inventory tracking columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN products.stock_quantity IS 'Available stock quantity (NULL = unlimited/digital product)';
COMMENT ON COLUMN products.low_stock_threshold IS 'Alert threshold for low stock warnings';
COMMENT ON COLUMN products.track_inventory IS 'Whether to track inventory for this product (only for clothing)';

-- Automatically enable inventory tracking for all clothing products
-- Clothing products are identified by having a gender field OR clothing-related categories
UPDATE products 
SET 
  track_inventory = true,
  stock_quantity = COALESCE(stock_quantity, 100), -- Default to 100 units if not set
  low_stock_threshold = 10
WHERE (
  gender IS NOT NULL 
  OR 
  EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(categories) AS cat 
    WHERE LOWER(cat) IN ('men', 'women', 'clothing', 'apparel')
  )
)
AND track_inventory IS NOT true; -- Only update if not already tracking

-- Ensure all digital/art products have inventory tracking disabled
UPDATE products 
SET 
  track_inventory = false,
  stock_quantity = NULL
WHERE (
  gender IS NULL 
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(categories) AS cat 
    WHERE LOWER(cat) IN ('men', 'women', 'clothing', 'apparel')
  )
);

-- Create index for inventory queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity) WHERE track_inventory = true;
CREATE INDEX IF NOT EXISTS idx_products_track_inventory ON products(track_inventory);

-- Create a view for low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  id,
  title,
  productid as sku,
  stock_quantity,
  low_stock_threshold,
  (stock_quantity - low_stock_threshold) as quantity_above_threshold
FROM products
WHERE track_inventory = true 
  AND stock_quantity IS NOT NULL 
  AND stock_quantity <= low_stock_threshold
ORDER BY stock_quantity ASC;

-- Create a view for out of stock products
CREATE OR REPLACE VIEW out_of_stock_products AS
SELECT 
  id,
  title,
  productid as sku,
  stock_quantity,
  status
FROM products
WHERE track_inventory = true 
  AND stock_quantity IS NOT NULL 
  AND stock_quantity <= 0
ORDER BY title;

-- Optional: Function to reduce stock after order
CREATE OR REPLACE FUNCTION reduce_product_stock(product_uuid UUID, quantity_sold INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
  tracks_inventory BOOLEAN;
BEGIN
  -- Get current stock and tracking status
  SELECT stock_quantity, track_inventory 
  INTO current_stock, tracks_inventory
  FROM products 
  WHERE id = product_uuid;
  
  -- Only reduce if inventory tracking is enabled
  IF tracks_inventory = true AND current_stock IS NOT NULL THEN
    -- Check if enough stock available
    IF current_stock >= quantity_sold THEN
      -- Reduce stock
      UPDATE products 
      SET stock_quantity = stock_quantity - quantity_sold,
          updated_at = NOW()
      WHERE id = product_uuid;
      RETURN TRUE;
    ELSE
      -- Insufficient stock
      RETURN FALSE;
    END IF;
  ELSE
    -- Inventory not tracked, allow order
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Optional: Function to add stock (restocking)
CREATE OR REPLACE FUNCTION add_product_stock(product_uuid UUID, quantity_added INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = COALESCE(stock_quantity, 0) + quantity_added,
      updated_at = NOW()
  WHERE id = product_uuid AND track_inventory = true;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust role names as needed)
-- GRANT SELECT ON low_stock_products TO authenticated;
-- GRANT SELECT ON out_of_stock_products TO authenticated;

COMMENT ON VIEW low_stock_products IS 'Products with stock at or below low stock threshold';
COMMENT ON VIEW out_of_stock_products IS 'Products that are out of stock';
COMMENT ON FUNCTION reduce_product_stock IS 'Reduces product stock quantity after a sale';
COMMENT ON FUNCTION add_product_stock IS 'Adds stock quantity when restocking';

-- Success message
DO $$ 
DECLARE
  clothing_count INTEGER;
  digital_count INTEGER;
BEGIN 
  -- Count products by type
  SELECT COUNT(*) INTO clothing_count FROM products WHERE track_inventory = true;
  SELECT COUNT(*) INTO digital_count FROM products WHERE track_inventory = false;
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Inventory system activated successfully!';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'New columns added: stock_quantity, low_stock_threshold, track_inventory';
  RAISE NOTICE 'Views created: low_stock_products, out_of_stock_products';
  RAISE NOTICE 'Functions created: reduce_product_stock(), add_product_stock()';
  RAISE NOTICE '';
  RAISE NOTICE 'Products configured:';
  RAISE NOTICE '  - Clothing products (inventory tracked): %', clothing_count;
  RAISE NOTICE '  - Digital/Art products (unlimited): %', digital_count;
  RAISE NOTICE '';
  RAISE NOTICE 'All clothing items now have:';
  RAISE NOTICE '  - track_inventory = true';
  RAISE NOTICE '  - stock_quantity = 100 (default)';
  RAISE NOTICE '  - low_stock_threshold = 10';
  RAISE NOTICE '====================================================';
END $$;

