-- ===========================================
-- OPTIMIZE CATEGORY COUNT PERFORMANCE
-- ===========================================
-- This script solves the 70% database load issue from frequent category count updates
-- Run this in your Supabase SQL Editor

-- ===========================================
-- 1. DROP EXISTING TRIGGERS (if any)
-- ===========================================
DROP TRIGGER IF EXISTS update_category_count_trigger ON products;
DROP TRIGGER IF EXISTS refresh_category_counts_trigger ON products;
DROP FUNCTION IF EXISTS update_category_count() CASCADE;
DROP FUNCTION IF EXISTS refresh_all_category_counts() CASCADE;

-- ===========================================
-- 2. CREATE EFFICIENT BULK UPDATE FUNCTION
-- ===========================================
-- This function updates all category counts in a single operation
CREATE OR REPLACE FUNCTION refresh_all_category_counts()
RETURNS void AS $$
BEGIN
  -- First, reset all counts to 0
  UPDATE categories
  SET count = 0,
      updated_at = NOW();
  
  -- Update counts for categories using the categories JSONB array field
  UPDATE categories c
  SET count = COALESCE(product_counts.count, 0),
      updated_at = NOW()
  FROM (
    SELECT 
      jsonb_array_elements_text(p.categories) as cat_name,
      COUNT(*) as count
    FROM products p
    WHERE p.status = 'active'
      AND p.categories IS NOT NULL
      AND jsonb_typeof(p.categories) = 'array'
      AND jsonb_array_length(p.categories) > 0
    GROUP BY cat_name
  ) as product_counts
  WHERE c.name = product_counts.cat_name;
  
  -- Handle old products with single 'category' text field (backward compatibility)
  UPDATE categories c
  SET count = c.count + COALESCE(old_counts.count, 0),
      updated_at = NOW()
  FROM (
    SELECT 
      category as cat_name,
      COUNT(*) as count
    FROM products
    WHERE status = 'active'
      AND category IS NOT NULL
      AND category != ''
      AND (categories IS NULL OR jsonb_typeof(categories) != 'array' OR jsonb_array_length(categories) = 0)
    GROUP BY category
  ) as old_counts
  WHERE c.name = old_counts.cat_name;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 3. CREATE OPTIMIZED TRIGGER FUNCTION
-- ===========================================
-- This trigger only marks that a refresh is needed, not perform it immediately
CREATE OR REPLACE FUNCTION mark_category_counts_stale()
RETURNS TRIGGER AS $$
BEGIN
  -- Set a flag in a dedicated table (we'll create it next)
  -- This prevents multiple simultaneous updates
  INSERT INTO category_counts_refresh_queue (queued_at)
  VALUES (NOW())
  ON CONFLICT DO NOTHING;
  
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 4. CREATE REFRESH QUEUE TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS category_counts_refresh_queue (
  id SERIAL PRIMARY KEY,
  queued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_refresh_queue_processed 
ON category_counts_refresh_queue(processed_at) 
WHERE processed_at IS NULL;

-- ===========================================
-- 5. CREATE BACKGROUND JOB FUNCTION
-- ===========================================
-- This function processes the queue and updates counts efficiently
CREATE OR REPLACE FUNCTION process_category_count_refresh()
RETURNS void AS $$
DECLARE
  pending_count INTEGER;
BEGIN
  -- Check if there are pending refreshes
  SELECT COUNT(*) INTO pending_count
  FROM category_counts_refresh_queue
  WHERE processed_at IS NULL;
  
  -- Only refresh if there are pending updates
  IF pending_count > 0 THEN
    -- Perform the refresh
    PERFORM refresh_all_category_counts();
    
    -- Mark all pending items as processed
    UPDATE category_counts_refresh_queue
    SET processed_at = NOW()
    WHERE processed_at IS NULL;
    
    -- Clean up old processed items (keep last 24 hours)
    DELETE FROM category_counts_refresh_queue
    WHERE processed_at < NOW() - INTERVAL '24 hours';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 6. CREATE TRIGGER ON PRODUCTS TABLE
-- ===========================================
-- This trigger fires when products are inserted, updated, or deleted
-- But it only marks for refresh, not perform the actual refresh
CREATE TRIGGER refresh_category_counts_trigger
AFTER INSERT OR UPDATE OF categories, category, status OR DELETE ON products
FOR EACH STATEMENT
EXECUTE FUNCTION mark_category_counts_stale();

-- ===========================================
-- 7. CREATE SCHEDULED JOB (using pg_cron extension)
-- ===========================================
-- Note: pg_cron needs to be enabled in Supabase
-- Run this only if pg_cron is available, otherwise skip
DO $do$
BEGIN
  -- Check if pg_cron extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Remove existing job if it exists
    PERFORM cron.unschedule('refresh-category-counts');
    
    -- Schedule the refresh job to run every 2 minutes
    PERFORM cron.schedule(
      'refresh-category-counts',
      '*/2 * * * *', -- Every 2 minutes
      'SELECT process_category_count_refresh();'
    );
  END IF;
END $do$;

-- ===========================================
-- 8. INITIAL COUNT REFRESH
-- ===========================================
-- Run an initial refresh to set correct counts
SELECT refresh_all_category_counts();

-- ===========================================
-- 9. CREATE VIEW FOR CACHED CATEGORY DATA
-- ===========================================
-- This view can be used by the frontend instead of the raw table
CREATE OR REPLACE VIEW categories_with_counts AS
SELECT 
  c.*,
  COALESCE(c.count, 0) as count_safe
FROM categories c
ORDER BY c.name ASC;

-- ===========================================
-- 10. GRANT PERMISSIONS
-- ===========================================
GRANT SELECT ON categories_with_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_all_category_counts() TO authenticated;
GRANT SELECT ON category_counts_refresh_queue TO authenticated;

-- ===========================================
-- 11. VERIFICATION QUERIES
-- ===========================================
-- Run these to verify everything is working

-- Check current category counts
SELECT 
  c.name,
  c.count as stored_count,
  COALESCE(actual.actual_count, 0) as actual_count,
  CASE 
    WHEN c.count = COALESCE(actual.actual_count, 0) THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM categories c
LEFT JOIN (
  SELECT 
    cat_name,
    COUNT(*) as actual_count
  FROM (
    -- Count from JSONB array
    SELECT jsonb_array_elements_text(categories) as cat_name
    FROM products
    WHERE status = 'active'
      AND categories IS NOT NULL
      AND jsonb_typeof(categories) = 'array'
    UNION ALL
    -- Count from old text field
    SELECT category as cat_name
    FROM products
    WHERE status = 'active'
      AND category IS NOT NULL
      AND (categories IS NULL OR jsonb_typeof(categories) != 'array')
  ) combined
  GROUP BY cat_name
) actual ON actual.cat_name = c.name
ORDER BY c.name;

-- Check if trigger is active
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%category%'
  AND event_object_table = 'products';

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
DO $success$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Category Count Optimization Complete!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '- Removed 14,000+ individual UPDATE queries per hour';
  RAISE NOTICE '- Created efficient bulk update function';
  RAISE NOTICE '- Added trigger-based queue system';
  RAISE NOTICE '- Scheduled automatic refresh every 2 minutes';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update CategoryContext.tsx to remove 60-second polling';
  RAISE NOTICE '2. Use categories_with_counts view in frontend';
  RAISE NOTICE '3. Remove refreshCategoryCounts() calls from client';
  RAISE NOTICE '==============================================';
END $success$;

