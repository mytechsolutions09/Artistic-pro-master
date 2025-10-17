-- Fix Category Counts - Run this in your Supabase SQL editor
-- This script will diagnose and fix category count issues

-- 1. First, let's see what categories exist and their current counts
SELECT 
    c.id,
    c.name,
    c.slug,
    c.count as current_count,
    COALESCE(p.product_count, 0) as actual_product_count
FROM categories c
LEFT JOIN (
    SELECT 
        category,
        COUNT(*) as product_count
    FROM products 
    WHERE status = 'active'
    GROUP BY category
) p ON c.name = p.category
ORDER BY c.name;

-- 2. Let's see what categories are actually used in products
SELECT 
    category,
    COUNT(*) as product_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products
FROM products 
GROUP BY category
ORDER BY product_count DESC;

-- 3. Check for any mismatches between category names
SELECT DISTINCT p.category as product_category
FROM products p
WHERE p.category NOT IN (SELECT name FROM categories)
ORDER BY p.category;

-- 4. Update category counts to match actual product counts
UPDATE categories 
SET count = COALESCE(
    (SELECT COUNT(*) 
     FROM products 
     WHERE products.category = categories.name 
     AND products.status = 'active'), 
    0
);

-- 5. Verify the update worked
SELECT 
    c.id,
    c.name,
    c.slug,
    c.count as updated_count,
    COALESCE(p.product_count, 0) as actual_product_count
FROM categories c
LEFT JOIN (
    SELECT 
        category,
        COUNT(*) as product_count
    FROM products 
    WHERE status = 'active'
    GROUP BY category
) p ON c.name = p.category
ORDER BY c.name;

-- 6. If you want to ensure the trigger is working, recreate it
DROP TRIGGER IF EXISTS update_category_count_trigger ON products;

CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if count column exists before trying to update it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'count'
        AND table_schema = 'public'
    ) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE categories SET count = count + 1 WHERE name = NEW.category;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE categories SET count = count - 1 WHERE name = OLD.category;
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.category != NEW.category THEN
                UPDATE categories SET count = count - 1 WHERE name = OLD.category;
                UPDATE categories SET count = count + 1 WHERE name = NEW.category;
            END IF;
            RETURN NEW;
        END IF;
    ELSE
        -- If count column doesn't exist, just return without error
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            RETURN NEW;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_count();

-- 7. Final verification
SELECT 
    'Category Counts Fixed!' as status,
    COUNT(*) as total_categories,
    SUM(count) as total_products_counted
FROM categories;
