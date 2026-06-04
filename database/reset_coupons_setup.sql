-- Reset coupons setup - run this if you need to start fresh
-- This will completely remove the coupons table and all related objects

-- Drop trigger first
DROP TRIGGER IF EXISTS trigger_update_coupons_updated_at ON coupons;

-- Drop policies
DROP POLICY IF EXISTS "Allow public read access to active coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users full access to coupons" ON coupons;
DROP POLICY IF EXISTS "Allow service role full access to coupons" ON coupons;

-- Drop functions
DROP FUNCTION IF EXISTS update_coupons_updated_at();
DROP FUNCTION IF EXISTS validate_coupon(TEXT, DECIMAL);
DROP FUNCTION IF EXISTS increment_coupon_usage(TEXT);

-- Drop table
DROP TABLE IF EXISTS coupons;

-- Verify cleanup
SELECT 'Coupons setup has been completely reset' as status;
