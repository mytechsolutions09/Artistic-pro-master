-- =====================================================
-- CLOTHES SECTION - DATABASE SETUP ONLY (NO STORAGE POLICIES)
-- =====================================================
-- Run this first, then create storage policies manually via UI
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

-- Add clothing type
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS clothingType TEXT;

-- Add material and brand columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add gender column (replaces categories for clothing)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add comments for documentation
COMMENT ON COLUMN products.productId IS 'Unique SKU (Stock Keeping Unit) for inventory tracking';
COMMENT ON COLUMN products.details IS 'Product details like material, weight, features';
COMMENT ON COLUMN products.washCare IS 'Washing and care instructions';
COMMENT ON COLUMN products.shipping IS 'Shipping information';
COMMENT ON COLUMN products.originalPrice IS 'Original price before discount';
COMMENT ON COLUMN products.discountPercentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN products.clothingType IS 'Type: Oversized Hoodies, Extra Oversized Hoodies, etc.';
COMMENT ON COLUMN products.gender IS 'Gender: Men, Women, or Unisex';

-- =====================================================
-- STEP 2: CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_productid 
ON products (productId) 
WHERE productId IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_clothingtype 
ON products (clothingType) 
WHERE clothingType IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_discounted 
ON products (discountPercentage) 
WHERE discountPercentage > 0;

CREATE INDEX IF NOT EXISTS idx_products_gender 
ON products (gender) 
WHERE gender IS NOT NULL;

-- =====================================================
-- STEP 3: HELPER FUNCTIONS
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
-- STEP 4: CREATE VIEW FOR CLOTHING PRODUCTS
-- =====================================================

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
-- STEP 5: GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON products TO authenticated;
GRANT INSERT ON products TO authenticated;
GRANT UPDATE ON products TO authenticated;
GRANT DELETE ON products TO authenticated;

GRANT SELECT ON clothing_products_view TO authenticated;
GRANT SELECT ON clothing_products_view TO anon;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('productid', 'details', 'washcare', 'shipping', 
                     'originalprice', 'discountpercentage', 'clothingtype', 
                     'material', 'brand', 'gender');

-- =====================================================
-- SUCCESS! 
-- =====================================================
-- Database setup complete!
-- Now create storage policies manually using:
-- CLOTHES_STORAGE_POLICIES_MANUAL.md
-- =====================================================

