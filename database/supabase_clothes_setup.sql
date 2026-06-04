-- =====================================================
-- COMPLETE SQL SETUP FOR CLOTHES SECTION
-- =====================================================
-- This script sets up the database structure and storage policies
-- for the clothing products management system
-- =====================================================

-- =====================================================
-- STEP 1: ADD CLOTHING-SPECIFIC COLUMNS TO PRODUCTS TABLE
-- =====================================================

-- Add Product ID (SKU) column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS productId TEXT;

-- Add unique constraint on SKU (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_productid_unique 
ON products (LOWER(productId)) 
WHERE productId IS NOT NULL;

-- Add clothing-specific text fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS washCare TEXT,
ADD COLUMN IF NOT EXISTS shipping TEXT;

-- Add pricing columns for discounts
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS originalPrice NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS discountPercentage NUMERIC(5, 2);

-- Add clothing type (alternatively, this can be stored in tags)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS clothingType TEXT;

-- Add material and brand columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add gender column (replaces categories for clothing)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add comment for documentation
COMMENT ON COLUMN products.productId IS 'Unique SKU (Stock Keeping Unit) for inventory tracking';
COMMENT ON COLUMN products.details IS 'Product details like material, weight, features';
COMMENT ON COLUMN products.washCare IS 'Washing and care instructions';
COMMENT ON COLUMN products.shipping IS 'Shipping information';
COMMENT ON COLUMN products.originalPrice IS 'Original price before discount';
COMMENT ON COLUMN products.discountPercentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN products.clothingType IS 'Type of clothing: Oversized Hoodies, Extra Oversized Hoodies, etc.';
COMMENT ON COLUMN products.gender IS 'Gender: Men, Women, or Unisex';

-- =====================================================
-- STEP 2: CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Index for SKU searches
CREATE INDEX IF NOT EXISTS idx_products_productid 
ON products (productId) 
WHERE productId IS NOT NULL;

-- Index for clothing type filtering
CREATE INDEX IF NOT EXISTS idx_products_clothingtype 
ON products (clothingType) 
WHERE clothingType IS NOT NULL;

-- Index for discounted products
CREATE INDEX IF NOT EXISTS idx_products_discounted 
ON products (discountPercentage) 
WHERE discountPercentage > 0;

-- Index for gender filtering
CREATE INDEX IF NOT EXISTS idx_products_gender 
ON products (gender) 
WHERE gender IS NOT NULL;

-- =====================================================
-- STEP 3: STORAGE BUCKET SETUP (clothes-images)
-- =====================================================

-- Verify the bucket exists (should already be created)
-- If not, create it:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'clothes-images',
    'clothes-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 4: STORAGE POLICIES FOR clothes-images BUCKET
-- =====================================================

-- NOTE: If you get permission errors, you need to set these policies 
-- through the Supabase Dashboard UI instead of SQL.
-- Go to: Storage → clothes-images → Policies

-- However, we'll try using DO blocks which sometimes work better

DO $$ 
BEGIN
    -- Policy 1: Allow authenticated users to upload images to clothes-images bucket
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload clothes images'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload clothes images"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (
            bucket_id = 'clothes-images'
        );
    END IF;

    -- Policy 2: Allow public read access to clothes images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow public read access to clothes images'
    ) THEN
        CREATE POLICY "Allow public read access to clothes images"
        ON storage.objects
        FOR SELECT
        TO public
        USING (
            bucket_id = 'clothes-images'
        );
    END IF;

    -- Policy 3: Allow authenticated users to update their clothes images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to update clothes images'
    ) THEN
        CREATE POLICY "Allow authenticated users to update clothes images"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (
            bucket_id = 'clothes-images'
        )
        WITH CHECK (
            bucket_id = 'clothes-images'
        );
    END IF;

    -- Policy 4: Allow authenticated users to delete clothes images
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to delete clothes images'
    ) THEN
        CREATE POLICY "Allow authenticated users to delete clothes images"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (
            bucket_id = 'clothes-images'
        );
    END IF;
END $$;

-- =====================================================
-- STEP 5: HELPER FUNCTIONS (OPTIONAL BUT USEFUL)
-- =====================================================

-- Function to check if SKU is unique
CREATE OR REPLACE FUNCTION is_sku_unique(sku TEXT, exclude_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    IF exclude_id IS NULL THEN
        RETURN NOT EXISTS (
            SELECT 1 FROM products 
            WHERE LOWER(productId) = LOWER(sku)
        );
    ELSE
        RETURN NOT EXISTS (
            SELECT 1 FROM products 
            WHERE LOWER(productId) = LOWER(sku) 
            AND id != exclude_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate discounted price
CREATE OR REPLACE FUNCTION calculate_discount_price(
    original_price NUMERIC,
    discount_percent NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
    IF discount_percent IS NULL OR discount_percent = 0 THEN
        RETURN original_price;
    END IF;
    RETURN ROUND(original_price - (original_price * discount_percent / 100));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- STEP 6: CREATE VIEW FOR CLOTHING PRODUCTS
-- =====================================================

-- View to easily query clothing products with calculated discount prices
CREATE OR REPLACE VIEW clothing_products_view AS
SELECT 
    p.*,
    CASE 
        WHEN p.originalPrice IS NOT NULL AND p.discountPercentage IS NOT NULL 
        THEN calculate_discount_price(p.originalPrice, p.discountPercentage)
        ELSE p.price
    END AS calculated_price,
    CASE 
        WHEN p.originalPrice IS NOT NULL AND p.originalPrice > p.price 
        THEN TRUE 
        ELSE FALSE 
    END AS has_discount
FROM products p
WHERE 
    p.gender IN ('Men', 'Women');

-- =====================================================
-- STEP 7: SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Query 1: Get all men's clothing with discounts
-- SELECT * FROM clothing_products_view 
-- WHERE gender = 'Men' AND has_discount = TRUE 
-- ORDER BY discountPercentage DESC;

-- Query 2: Get products by SKU
-- SELECT * FROM products WHERE productId = 'HOODIE-001';

-- Query 3: Get all oversized hoodies
-- SELECT * FROM products WHERE clothingType = 'Oversized Hoodies';

-- Query 4: Get clothing by size (from tags)
-- SELECT * FROM products WHERE 'XL' = ANY(tags);

-- Query 5: Get clothing by color (from tags)
-- SELECT * FROM products WHERE 'Black' = ANY(tags);

-- =====================================================
-- STEP 8: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON products TO authenticated;
GRANT INSERT ON products TO authenticated;
GRANT UPDATE ON products TO authenticated;
GRANT DELETE ON products TO authenticated;

-- Grant permissions on the view
GRANT SELECT ON clothing_products_view TO authenticated;
GRANT SELECT ON clothing_products_view TO anon;

-- =====================================================
-- STEP 9: VERIFICATION QUERIES
-- =====================================================

-- Check if all columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
-- AND column_name IN ('productid', 'details', 'washcare', 'shipping', 'originalprice', 'discountpercentage', 'clothingtype', 'material', 'brand', 'gender');

-- Check storage policies
-- SELECT * FROM pg_policies 
-- WHERE tablename = 'objects' 
-- AND policyname LIKE '%clothes%';

-- Check bucket configuration
-- SELECT * FROM storage.buckets WHERE id = 'clothes-images';

-- =====================================================
-- NOTES AND RECOMMENDATIONS
-- =====================================================

/*
1. BACKUP: Always backup your database before running ALTER TABLE commands

2. SKU FORMAT: Use consistent SKU format like:
   - HOODIE-BLK-L-001
   - TSHIRT-WHT-M-002
   
3. GENDER: Products should have gender set to: 'Men', 'Women', or 'Unisex'

4. TAGS: Store sizes, colors, and other attributes in the tags array:
   - Sizes: 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
   - Colors: 'Black', 'White', 'Blue', 'Red', etc.
   - Clothing types: 'Oversized Hoodies', 'Extra Oversized Hoodies', etc.

5. IMAGES: 
   - Upload to 'clothes-images' bucket
   - Store URLs in the images array field
   - First image in array = main_image

6. PRICING:
   - price: Current selling price (after discount)
   - originalPrice: Price before discount (optional)
   - discountPercentage: Percentage off (optional)
   - Auto-calculate: price = originalPrice - (originalPrice * discountPercentage / 100)

7. STORAGE LIMITS:
   - Max file size: 10MB
   - Allowed formats: JPEG, JPG, PNG, GIF, WEBP

8. INDEXES: The created indexes will improve query performance for:
   - SKU searches
   - Clothing type filtering
   - Discount filtering
   - Category searches

9. SECURITY:
   - Only authenticated users can upload/modify images
   - Public users can view images
   - Row Level Security (RLS) is enabled

10. VALIDATION:
    - Use is_sku_unique() function to check SKU uniqueness before insert/update
    - Ensure discountPercentage is between 0-100
    - Ensure originalPrice > price when discount is applied
*/

-- =====================================================
-- END OF SCRIPT
-- =====================================================

-- Run this entire script in your Supabase SQL Editor
-- to set up the complete clothing products system

