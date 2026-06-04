-- =====================================================
-- RESTORE FAVORITES FOREIGN KEY CONSTRAINT
-- =====================================================
-- This script restores the foreign key relationship
-- between favorites.product_id and products.id
-- 
-- Since normal items are now stored in the products table,
-- we need this foreign key for Supabase automatic joins
-- =====================================================

-- Step 1: Verify all product_id values in favorites reference valid products
-- (This query should return 0 rows if all references are valid)
SELECT f.product_id, f.id as favorite_id
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
WHERE p.id IS NULL;

-- Step 2: Add the foreign key constraint back
-- This will fail if there are invalid references (from Step 1)
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- Step 3: Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'favorites'
  AND kcu.column_name = 'product_id';

-- Note: The item_type column can remain for potential future use,
-- but the foreign key ensures data integrity and enables Supabase joins
