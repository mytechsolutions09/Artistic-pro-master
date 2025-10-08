-- Fix clothing orders that were incorrectly saved as posters
-- This will update the order_items table to correct the data

-- First, let's see what we're working with
SELECT 
    id,
    product_title,
    selected_product_type,
    selected_poster_size,
    options
FROM order_items 
WHERE product_title ILIKE '%crewneck%' 
   OR product_title ILIKE '%sweatshirt%'
   OR product_title ILIKE '%hoodie%'
   OR product_title ILIKE '%t-shirt%'
   OR product_title ILIKE '%shirt%'
   OR product_title ILIKE '%jacket%'
   OR product_title ILIKE '%sweater%'
   OR product_title ILIKE '%oversized%'
ORDER BY id DESC;

-- Update clothing items that were incorrectly saved as posters
-- This assumes the "size" information is in selected_poster_size
UPDATE order_items 
SET 
    selected_product_type = 'clothing',
    options = CASE 
        WHEN selected_poster_size IS NOT NULL THEN 
            jsonb_build_object('size', selected_poster_size)
        ELSE 
            NULL 
    END,
    selected_poster_size = NULL
WHERE selected_product_type = 'poster' 
  AND (
    product_title ILIKE '%crewneck%' OR
    product_title ILIKE '%sweatshirt%' OR
    product_title ILIKE '%hoodie%' OR
    product_title ILIKE '%t-shirt%' OR
    product_title ILIKE '%shirt%' OR
    product_title ILIKE '%jacket%' OR
    product_title ILIKE '%sweater%' OR
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
WHERE product_title ILIKE '%crewneck%' 
   OR product_title ILIKE '%sweatshirt%'
   OR product_title ILIKE '%hoodie%'
   OR product_title ILIKE '%t-shirt%'
   OR product_title ILIKE '%shirt%'
   OR product_title ILIKE '%jacket%'
   OR product_title ILIKE '%sweater%'
   OR product_title ILIKE '%oversized%'
ORDER BY id DESC;
