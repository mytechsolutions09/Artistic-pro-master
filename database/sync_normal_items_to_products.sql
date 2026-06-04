-- =====================================================
-- SYNC EXISTING NORMAL ITEMS TO PRODUCTS TABLE
-- =====================================================
-- This script ensures all normal_items have corresponding
-- entries in the products table, which is required for
-- favorites to work properly
-- =====================================================

-- Step 1: Find normal items that don't have corresponding products
SELECT 
    ni.id,
    ni.title,
    ni.price,
    ni.status,
    'Missing product entry' as issue
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL;

-- Step 2: Insert missing products for normal items
-- This creates product entries for any normal items that don't have them
INSERT INTO products (
    id,
    title,
    description,
    price,
    original_price,
    discount_percentage,
    categories,
    images,
    main_image,
    status,
    tags,
    item_details,
    delivery,
    did_you_know,
    product_type,
    featured,
    created_at,
    updated_at
)
SELECT 
    ni.id,
    ni.title,
    ni.description,
    ni.price,
    ni.original_price,
    ni.discount_percentage,
    ARRAY['Normal']::text[] as categories,
    ni.images,
    COALESCE(ni.main_image, ni.images[1]) as main_image,
    ni.status,
    COALESCE(ni.tags, ARRAY[]::text[]) as tags,
    COALESCE(ni.item_details, '{}'::jsonb) as item_details,
    COALESCE(ni.delivery_info, '{}'::jsonb) as delivery,
    COALESCE(ni.did_you_know, '{}'::jsonb) as did_you_know,
    'digital' as product_type, -- Normal items are treated as digital products in the system
    false as featured,
    ni.created_at,
    ni.updated_at
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify all normal items now have products
SELECT 
    COUNT(*) as normal_items_without_products
FROM normal_items ni
LEFT JOIN products p ON ni.id = p.id
WHERE p.id IS NULL;

-- This should return 0 if everything is synced correctly
