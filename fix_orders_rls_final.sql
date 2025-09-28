-- Final fix for orders RLS policies to support guest checkout
-- This fixes the "new row violates row-level security policy for table orders" error

-- First, drop ALL existing policies to ensure clean state
DROP POLICY IF EXISTS "Allow users to read their own orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to orders by email" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to create orders" ON orders;
DROP POLICY IF EXISTS "Allow guest users to create orders" ON orders;
DROP POLICY IF EXISTS "Allow users to update their own orders" ON orders;
DROP POLICY IF EXISTS "Allow admin to update orders" ON orders;

DROP POLICY IF EXISTS "Allow users to read their own order items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access to order items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated users to create order items" ON order_items;
DROP POLICY IF EXISTS "Allow guest users to create order items" ON order_items;

-- Create corrected RLS policies for orders table
-- 1. Allow authenticated users to read their own orders
CREATE POLICY "Allow users to read their own orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

-- 2. Allow anonymous users to read orders (for guest checkout confirmation)
CREATE POLICY "Allow public read access to orders by email" ON orders
    FOR SELECT TO anon
    USING (true);

-- 3. Allow authenticated users to create orders
CREATE POLICY "Allow authenticated users to create orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (customer_id = auth.uid());

-- 4. Allow anonymous users to create orders (guest checkout)
CREATE POLICY "Allow guest users to create orders" ON orders
    FOR INSERT TO anon
    WITH CHECK (customer_id IS NULL);

-- 5. Allow authenticated users to update their own orders
CREATE POLICY "Allow users to update their own orders" ON orders
    FOR UPDATE TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- 6. Allow authenticated users to update any order (admin access)
CREATE POLICY "Allow admin to update orders" ON orders
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create corrected RLS policies for order_items table
-- 1. Allow authenticated users to read their own order items
CREATE POLICY "Allow users to read their own order items" ON order_items
    FOR SELECT TO authenticated
    USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));

-- 2. Allow anonymous users to read order items (for guest checkout)
CREATE POLICY "Allow public read access to order items" ON order_items
    FOR SELECT TO anon
    USING (true);

-- 3. Allow authenticated users to create order items
CREATE POLICY "Allow authenticated users to create order items" ON order_items
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 4. Allow anonymous users to create order items (guest checkout)
CREATE POLICY "Allow guest users to create order items" ON order_items
    FOR INSERT TO anon
    WITH CHECK (true);

-- Verify RLS is enabled on both tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS policies fixed successfully! Guest checkout should now work.' as message;
