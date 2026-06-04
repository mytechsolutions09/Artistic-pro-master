-- =====================================================
-- RAZORPAY PAYMENT INTEGRATION - DATABASE SETUP
-- =====================================================
-- This script sets up the necessary tables and policies
-- for Razorpay payment integration
-- =====================================================

-- Create razorpay_orders table
CREATE TABLE IF NOT EXISTS public.razorpay_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL, -- Amount in paise
    currency TEXT DEFAULT 'INR',
    customer_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'success', 'failed', 'refunded')),
    payment_method TEXT,
    error_code TEXT,
    error_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_order_id ON public.razorpay_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_razorpay_order_id ON public.razorpay_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_customer_id ON public.razorpay_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_status ON public.razorpay_orders(status);
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_created_at ON public.razorpay_orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.razorpay_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own payment records" ON public.razorpay_orders;
DROP POLICY IF EXISTS "Service role can manage all payment records" ON public.razorpay_orders;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.razorpay_orders;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.razorpay_orders;

-- Policy: Users can view their own payment records
CREATE POLICY "Users can view their own payment records"
ON public.razorpay_orders
FOR SELECT
TO authenticated
USING (
    customer_email = auth.jwt()->>'email'
    OR
    customer_id = auth.uid()::text
);

-- Policy: Allow insert for authenticated users and service role
CREATE POLICY "Allow insert for authenticated users"
ON public.razorpay_orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow update for authenticated users (for their own records)
CREATE POLICY "Allow update for authenticated users"
ON public.razorpay_orders
FOR UPDATE
TO authenticated
USING (
    customer_email = auth.jwt()->>'email'
    OR
    customer_id = auth.uid()::text
);

-- Policy: Service role can manage all payment records
CREATE POLICY "Service role can manage all payment records"
ON public.razorpay_orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_razorpay_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_razorpay_orders_updated_at ON public.razorpay_orders;
CREATE TRIGGER set_razorpay_orders_updated_at
    BEFORE UPDATE ON public.razorpay_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_razorpay_orders_updated_at();

-- Create razorpay_refunds table for tracking refunds
CREATE TABLE IF NOT EXISTS public.razorpay_refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    razorpay_payment_id TEXT NOT NULL,
    razorpay_refund_id TEXT NOT NULL UNIQUE,
    order_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in paise
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    FOREIGN KEY (order_id) REFERENCES public.razorpay_orders(order_id) ON DELETE CASCADE
);

-- Create indexes for refunds table
CREATE INDEX IF NOT EXISTS idx_razorpay_refunds_payment_id ON public.razorpay_refunds(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_refunds_order_id ON public.razorpay_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_refunds_status ON public.razorpay_refunds(status);

-- Enable RLS for refunds table
ALTER TABLE public.razorpay_refunds ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own refunds
CREATE POLICY "Users can view their own refunds"
ON public.razorpay_refunds
FOR SELECT
TO authenticated
USING (
    order_id IN (
        SELECT order_id FROM public.razorpay_orders
        WHERE customer_email = auth.jwt()->>'email'
        OR customer_id = auth.uid()::text
    )
);

-- Policy: Service role can manage all refunds
CREATE POLICY "Service role can manage all refunds"
ON public.razorpay_refunds
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.razorpay_orders TO authenticated;
GRANT ALL ON public.razorpay_orders TO service_role;
GRANT ALL ON public.razorpay_refunds TO authenticated;
GRANT ALL ON public.razorpay_refunds TO service_role;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('razorpay_orders', 'razorpay_refunds');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('razorpay_orders', 'razorpay_refunds');

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('razorpay_orders', 'razorpay_refunds')
ORDER BY indexname;
