-- =====================================================
-- OPTIMIZE FAVORITES PERFORMANCE
-- =====================================================
-- This script creates a materialized view and indexes
-- to dramatically improve favorites count performance
-- =====================================================

-- Step 1: Create a materialized view for favorites counts
-- This pre-calculates favorites counts instead of doing it on every query
CREATE MATERIALIZED VIEW IF NOT EXISTS product_favorites_count AS
SELECT 
    product_id,
    COUNT(*) as favorites_count
FROM favorites
GROUP BY product_id;

-- Create unique index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_favorites_count_product_id 
ON product_favorites_count(product_id);

-- Step 2: Create indexes on favorites table if they don't exist
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Step 3: Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_product_favorites_count()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY product_favorites_count;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a trigger to auto-refresh when favorites change
CREATE OR REPLACE FUNCTION trigger_refresh_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh the materialized view after insert/delete
    -- Use CONCURRENTLY to allow reads during refresh
    PERFORM refresh_product_favorites_count();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS favorites_changed_trigger ON favorites;

-- Create trigger
CREATE TRIGGER favorites_changed_trigger
AFTER INSERT OR DELETE ON favorites
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_favorites_count();

-- Step 5: Initial refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY product_favorites_count;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the optimization is working:
--
-- 1. Check materialized view data:
-- SELECT * FROM product_favorites_count LIMIT 10;
--
-- 2. Test query performance (should be < 100ms):
-- EXPLAIN ANALYZE
-- SELECT p.*, COALESCE(pfc.favorites_count, 0) as favorites_count
-- FROM products p
-- LEFT JOIN product_favorites_count pfc ON p.id = pfc.product_id
-- ORDER BY p.created_date DESC;
-- =====================================================

COMMENT ON MATERIALIZED VIEW product_favorites_count IS 'Cached favorites counts for performance';
COMMENT ON FUNCTION refresh_product_favorites_count() IS 'Refresh cached favorites counts';

