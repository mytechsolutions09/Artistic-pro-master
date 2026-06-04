-- =====================================================
-- CLEANUP ORPHANED FAVORITES AND RESTORE FOREIGN KEY
-- =====================================================
-- This script:
-- 1. Identifies favorites with invalid product_id references
-- 2. Optionally cleans them up (or you can review first)
-- 3. Restores the foreign key constraint
-- =====================================================

-- Step 1: Check for orphaned favorites (favorites referencing non-existent products)
-- This will show you what will be deleted
SELECT 
    f.id as favorite_id,
    f.user_id,
    f.product_id,
    f.created_at,
    f.item_type
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
WHERE p.id IS NULL;

-- Step 2: Count how many orphaned favorites exist
SELECT COUNT(*) as orphaned_favorites_count
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
WHERE p.id IS NULL;

-- Step 3: DELETE orphaned favorites (uncomment to execute)
-- WARNING: This will permanently delete favorites that reference non-existent products
-- DELETE FROM favorites
-- WHERE product_id NOT IN (SELECT id FROM products);

-- Step 4: Alternative - Check if any orphaned favorites might be normal items
-- that need to be synced to products table
SELECT 
    f.id as favorite_id,
    f.product_id,
    ni.id as normal_item_id,
    ni.title as normal_item_title
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
LEFT JOIN normal_items ni ON f.product_id = ni.id
WHERE p.id IS NULL AND ni.id IS NOT NULL;

-- Step 5: If there are normal items that need to be synced to products,
-- you'll need to ensure they exist in products table first.
-- This should have been handled by NormalItemsService, but let's verify:
SELECT 
    ni.id,
    ni.title,
    p.id as product_id
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL;

-- Step 6: After cleanup, restore the foreign key constraint
-- First, drop it if it exists (in case it was partially created)
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;

-- Step 7: Add the foreign key constraint
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- Step 8: Verify the constraint was added
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
