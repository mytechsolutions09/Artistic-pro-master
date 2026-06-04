-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
    discount DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_validity ON coupons(valid_from, valid_until);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS trigger_update_coupons_updated_at ON coupons;
CREATE TRIGGER trigger_update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_coupons_updated_at();

-- Insert sample coupons
INSERT INTO coupons (code, description, type, discount, min_amount, max_uses, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 1000.00, 100, '2024-01-01', '2025-12-31', true),
('SAVE20', '20% off on orders above ₹2000', 'percentage', 20.00, 2000.00, 50, '2024-01-01', '2025-12-31', true),
('FLAT100', 'Flat ₹100 off on orders above ₹500', 'fixed', 100.00, 500.00, 200, '2024-01-01', '2025-12-31', false)
ON CONFLICT (code) DO NOTHING;

-- Create RLS policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users full access to coupons" ON coupons;
DROP POLICY IF EXISTS "Allow service role full access to coupons" ON coupons;

-- Policy for reading coupons (public access for validation)
CREATE POLICY "Allow public read access to active coupons" ON coupons
    FOR SELECT USING (is_active = true);

-- Policy for authenticated users (admin operations)
CREATE POLICY "Allow authenticated users full access to coupons" ON coupons
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy for service role (server-side operations)
CREATE POLICY "Allow service role full access to coupons" ON coupons
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(
    coupon_code TEXT,
    order_amount DECIMAL(10,2)
)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_amount DECIMAL(10,2),
    error_message TEXT
) AS $$
DECLARE
    coupon_record coupons%ROWTYPE;
    calculated_discount DECIMAL(10,2);
BEGIN
    -- Get coupon details
    SELECT * INTO coupon_record 
    FROM coupons 
    WHERE code = UPPER(coupon_code) 
    AND is_active = true;
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0.00, 'Invalid coupon code';
        RETURN;
    END IF;
    
    -- Check if coupon is expired
    IF coupon_record.valid_until < CURRENT_DATE THEN
        RETURN QUERY SELECT false, 0.00, 'Coupon has expired';
        RETURN;
    END IF;
    
    -- Check if coupon is not yet valid
    IF coupon_record.valid_from > CURRENT_DATE THEN
        RETURN QUERY SELECT false, 0.00, 'Coupon is not yet valid';
        RETURN;
    END IF;
    
    -- Check minimum amount
    IF order_amount < coupon_record.min_amount THEN
        RETURN QUERY SELECT false, 0.00, 
            'Minimum order amount of ' || coupon_record.min_amount || ' required';
        RETURN;
    END IF;
    
    -- Check usage limit
    IF coupon_record.max_uses IS NOT NULL AND coupon_record.used_count >= coupon_record.max_uses THEN
        RETURN QUERY SELECT false, 0.00, 'Coupon usage limit reached';
        RETURN;
    END IF;
    
    -- Calculate discount
    IF coupon_record.type = 'percentage' THEN
        calculated_discount := (order_amount * coupon_record.discount) / 100;
    ELSE
        calculated_discount := coupon_record.discount;
    END IF;
    
    RETURN QUERY SELECT true, calculated_discount, 'Valid coupon';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE coupons 
    SET used_count = used_count + 1,
        updated_at = NOW()
    WHERE code = UPPER(coupon_code)
    AND is_active = true
    AND (max_uses IS NULL OR used_count < max_uses)
    AND valid_until >= CURRENT_DATE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON coupons TO anon, authenticated;
GRANT ALL ON coupons TO service_role;
GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, DECIMAL) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_coupon_usage(TEXT) TO service_role;

-- Add comments for documentation
COMMENT ON TABLE coupons IS 'Stores discount coupons and promotional codes';
COMMENT ON COLUMN coupons.code IS 'Unique coupon code (case insensitive)';
COMMENT ON COLUMN coupons.type IS 'Discount type: percentage or fixed amount';
COMMENT ON COLUMN coupons.discount IS 'Discount value (percentage or fixed amount)';
COMMENT ON COLUMN coupons.min_amount IS 'Minimum order amount required to use this coupon';
COMMENT ON COLUMN coupons.max_uses IS 'Maximum number of times this coupon can be used (NULL for unlimited)';
COMMENT ON COLUMN coupons.used_count IS 'Number of times this coupon has been used';
COMMENT ON COLUMN coupons.valid_from IS 'Date from which coupon becomes valid';
COMMENT ON COLUMN coupons.valid_until IS 'Date until which coupon remains valid';
COMMENT ON COLUMN coupons.is_active IS 'Whether the coupon is currently active';

-- Verify the setup
SELECT 
    'Coupons table created successfully' as status,
    COUNT(*) as total_coupons
FROM coupons;
