-- =====================================================
-- FIX FAVORITES FOREIGN KEY CONSTRAINT
-- =====================================================
-- This script fixes the foreign key issue by:
-- 1. Deleting orphaned favorites (favorites referencing non-existent products)
-- 2. Restoring the foreign key constraint
-- =====================================================

-- Step 1: Show orphaned favorites before deletion (for review)
SELECT 
    f.id as favorite_id,
    f.user_id,
    f.product_id,
    f.created_at,
    'Will be deleted' as action
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
WHERE p.id IS NULL;

-- Step 2: Delete orphaned favorites
-- These are favorites that reference products that no longer exist
DELETE FROM favorites
WHERE product_id NOT IN (SELECT id FROM products);

-- Step 3: Drop existing foreign key if it exists (to avoid conflicts)
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;

-- Step 4: Add the foreign key constraint
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- Step 5: Verify the constraint was added successfully
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

-- Done! The foreign key is now restored and orphaned favorites have been cleaned up.
