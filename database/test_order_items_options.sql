-- Test query to check if options data exists in order_items table
-- Run this in Supabase SQL Editor to see what data we have

-- Check the structure of order_items table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Check if options column exists and has data
SELECT 
    id,
    product_title,
    selected_product_type,
    options,
    quantity,
    created_at
FROM order_items 
WHERE selected_product_type = 'clothing' 
   OR product_title ILIKE '%sweatshirt%'
   OR product_title ILIKE '%crewneck%'
ORDER BY created_at DESC 
LIMIT 10;

-- Check all recent order_items to see the data structure
SELECT 
    id,
    product_title,
    selected_product_type,
    selected_poster_size,
    options,
    quantity
FROM order_items 
ORDER BY created_at DESC 
LIMIT 20;
