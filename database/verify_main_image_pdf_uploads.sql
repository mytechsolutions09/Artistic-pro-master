-- Verify that main_image and pdf_url are being properly stored
-- This script checks the current state of products and their main images/PDFs

SELECT 
    id,
    title,
    product_type,
    main_image,
    pdf_url,
    images,
    CASE 
        WHEN main_image IS NOT NULL THEN '✅ Main Image Set'
        WHEN images IS NOT NULL AND array_length(images, 1) > 0 THEN '⚠️ Using First Image as Main'
        ELSE '❌ No Main Image'
    END as main_image_status,
    CASE 
        WHEN pdf_url IS NOT NULL THEN '✅ PDF Set'
        ELSE '❌ No PDF'
    END as pdf_status
FROM products 
ORDER BY created_date DESC
LIMIT 10;

-- Check products that need main_image updates
SELECT 
    id,
    title,
    main_image,
    images[1] as first_image,
    'Needs main_image update' as status
FROM products 
WHERE main_image IS NULL 
  AND images IS NOT NULL 
  AND array_length(images, 1) > 0
ORDER BY created_date DESC;
