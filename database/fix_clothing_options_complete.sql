-- Complete fix for clothing orders: Remove selected_poster_size and add color
-- This script will properly format clothing options with color and size

-- First, let's see the current state
SELECT 
    id,
    product_title,
    selected_product_type,
    selected_poster_size,
    options
FROM order_items 
WHERE selected_product_type = 'clothing' 
   OR product_title ILIKE '%crewneck%' 
   OR product_title ILIKE '%sweatshirt%'
   OR product_title ILIKE '%hoodie%'
   OR product_title ILIKE '%t-shirt%'
   OR product_title ILIKE '%shirt%'
   OR product_title ILIKE '%jacket%'
   OR product_title ILIKE '%sweater%'
   OR product_title ILIKE '%oversized%'
ORDER BY id DESC;

-- Update clothing items to add color based on product title and remove selected_poster_size
UPDATE order_items 
SET 
    selected_poster_size = NULL,  -- Remove poster size completely
    options = CASE 
        -- For "Jet Black Crewneck Sweatshirt with blue piping" - extract color from title
        WHEN product_title ILIKE '%jet black%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Black')
        WHEN product_title ILIKE '%black%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Black')
        WHEN product_title ILIKE '%white%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'White')
        WHEN product_title ILIKE '%gray%' OR product_title ILIKE '%grey%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Gray')
        WHEN product_title ILIKE '%blue%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Blue')
        WHEN product_title ILIKE '%red%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Red')
        WHEN product_title ILIKE '%green%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Green')
        WHEN product_title ILIKE '%pink%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Pink')
        WHEN product_title ILIKE '%yellow%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Yellow')
        WHEN product_title ILIKE '%purple%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Purple')
        WHEN product_title ILIKE '%orange%' THEN 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Orange')
        -- Default case - keep existing size, add default color
        ELSE 
            jsonb_build_object('size', COALESCE(options->>'size', 'M'), 'color', 'Black')
    END
WHERE selected_product_type = 'clothing' 
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
WHERE selected_product_type = 'clothing' 
   OR product_title ILIKE '%crewneck%' 
   OR product_title ILIKE '%sweatshirt%'
   OR product_title ILIKE '%hoodie%'
   OR product_title ILIKE '%t-shirt%'
   OR product_title ILIKE '%shirt%'
   OR product_title ILIKE '%jacket%'
   OR product_title ILIKE '%sweater%'
   OR product_title ILIKE '%oversized%'
ORDER BY id DESC;
