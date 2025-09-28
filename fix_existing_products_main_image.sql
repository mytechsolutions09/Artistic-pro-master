-- Fix existing products to set main_image from first image in images array
-- This will update products where main_image is null but images array has content

UPDATE products 
SET main_image = images[1]  -- PostgreSQL arrays are 1-indexed
WHERE main_image IS NULL 
  AND images IS NOT NULL 
  AND array_length(images, 1) > 0;

-- Verify the changes
SELECT 
    id,
    title,
    main_image,
    images,
    pdf_url
FROM products 
WHERE main_image IS NOT NULL
ORDER BY created_date DESC
LIMIT 10;
