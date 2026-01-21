-- =====================================================
-- COMPLETE FIX FOR FAVORITES FOREIGN KEY ISSUE
-- =====================================================
-- This script:
-- 1. Syncs existing normal_items to products table
-- 2. Cleans up orphaned favorites
-- 3. Restores the foreign key constraint
-- =====================================================

-- ============================================
-- STEP 1: Sync normal_items to products table
-- ============================================
-- Find normal items that don't have corresponding products
SELECT 
    COUNT(*) as normal_items_missing_products
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL;

-- Insert missing products for normal items
INSERT INTO products (
    id,
    title,
    description,
    price,
    original_price,
    discount_percentage,
    category,
    categories,
    images,
    main_image,
    status,
    tags,
    item_details,
    delivery_info,
    did_you_know,
    product_type,
    featured,
    created_date,
    updated_at
)
SELECT 
    ni.id,
    ni.title,
    ni.description,
    ni.price,
    ni.original_price,
    ni.discount_percentage,
    'Normal' as category,
    jsonb_build_array('Normal') as categories,
    ni.images,
    COALESCE(ni.main_image, ni.images[1]) as main_image,
    ni.status,
    COALESCE(ni.tags, ARRAY[]::text[]) as tags,
    COALESCE(ni.item_details, '{}'::jsonb) as item_details,
    COALESCE(ni.delivery_info, '{}'::jsonb) as delivery_info,
    COALESCE(ni.did_you_know, '{}'::jsonb) as did_you_know,
    'digital' as product_type,
    false as featured,
    ni.created_at as created_date,
    ni.updated_at
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Clean up orphaned favorites
-- ============================================
-- Show orphaned favorites before deletion
SELECT 
    f.id as favorite_id,
    f.user_id,
    f.product_id,
    f.created_at,
    'Will be deleted' as action
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
WHERE p.id IS NULL;

-- Delete orphaned favorites
DELETE FROM favorites
WHERE product_id NOT IN (SELECT id FROM products);

-- ============================================
-- STEP 3: Restore foreign key constraint
-- ============================================
-- Drop existing foreign key if it exists (to avoid conflicts)
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;

-- Add the foreign key constraint
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE CASCADE;

-- ============================================
-- STEP 4: Verify everything is correct
-- ============================================
-- Verify all normal items have products
SELECT 
    COUNT(*) as normal_items_without_products
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL;
-- Should return 0

-- Verify no orphaned favorites exist
SELECT 
    COUNT(*) as orphaned_favorites
FROM favorites f
LEFT JOIN products p ON f.product_id = p.id
WHERE p.id IS NULL;
-- Should return 0

-- Verify the foreign key constraint exists
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
-- Should return 1 row showing the constraint

-- Done! The favorites system should now work correctly.
