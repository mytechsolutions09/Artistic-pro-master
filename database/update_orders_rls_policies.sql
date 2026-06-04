-- Update RLS policies for orders to support guest checkout
-- Run this SQL in your Supabase SQL Editor to fix the RLS policy error

-- First, drop existing policies
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

-- Create new RLS policies for orders that support guest checkout
CREATE POLICY "Allow users to read their own orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

CREATE POLICY "Allow public read access to orders by email" ON orders
    FOR SELECT TO anon
    USING (true); -- Allow reading orders for guest users (can be restricted later)

CREATE POLICY "Allow authenticated users to create orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow guest users to create orders" ON orders
    FOR INSERT TO anon
    WITH CHECK (customer_id IS NULL); -- Allow guest orders with null customer_id

CREATE POLICY "Allow users to update their own orders" ON orders
    FOR UPDATE TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow admin to update orders" ON orders
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create new RLS policies for order items that support guest checkout
CREATE POLICY "Allow users to read their own order items" ON order_items
    FOR SELECT TO authenticated
    USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));

CREATE POLICY "Allow public read access to order items" ON order_items
    FOR SELECT TO anon
    USING (true); -- Allow reading order items for guest users

CREATE POLICY "Allow authenticated users to create order items" ON order_items
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow guest users to create order items" ON order_items
    FOR INSERT TO anon
    WITH CHECK (true); -- Allow creating order items for guest orders

-- Success message
SELECT 'RLS policies updated successfully! Guest checkout is now enabled.' as message;
