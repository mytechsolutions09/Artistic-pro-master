-- =====================================================
-- UPDATE FAVORITES TABLE TO SUPPORT NORMAL ITEMS
-- =====================================================
-- This script modifies the favorites table to support
-- both products and normal_items by removing the strict
-- foreign key constraint and adding an item_type field
-- =====================================================

-- Step 1: Drop the foreign key constraint
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;

-- Step 2: Add item_type column to distinguish between products and normal_items
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS item_type VARCHAR(20) DEFAULT 'product' CHECK (item_type IN ('product', 'normal_item'));

-- Step 3: Update existing favorites to have item_type = 'product'
UPDATE favorites 
SET item_type = 'product' 
WHERE item_type IS NULL;

-- Step 4: Create index on item_type for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);

-- Step 5: Create composite index for user_id and item_type
CREATE INDEX IF NOT EXISTS idx_favorites_user_item_type ON favorites(user_id, item_type);

-- Step 6: Update the unique constraint to include item_type
-- First, drop the existing unique constraint
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_user_id_product_id_key;

-- Add new unique constraint that includes item_type
ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_item_unique UNIQUE(user_id, product_id, item_type);

-- Add comment
COMMENT ON COLUMN favorites.item_type IS 'Type of item: product (from products table) or normal_item (from normal_items table)';
COMMENT ON COLUMN favorites.product_id IS 'ID of the product or normal_item (no longer a strict foreign key)';
