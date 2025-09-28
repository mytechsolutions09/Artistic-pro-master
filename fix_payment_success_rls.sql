-- Fix RLS policies to allow reading orders for payment success page
-- This ensures the payment success page can fetch order details

-- Drop existing read policies
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "Allow public read access to orders by email" ON orders;
DROP POLICY IF EXISTS "Allow users to read their own orders" ON orders;

-- Create new comprehensive read policies
CREATE POLICY "orders_select_policy" ON orders
    FOR SELECT 
    USING (true);

-- Also ensure order_items can be read
DROP POLICY IF EXISTS "order_items_select_policy" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order items" ON order_items;

CREATE POLICY "order_items_select_policy" ON order_items
    FOR SELECT 
    USING (true);

-- Success message
SELECT 'RLS policies updated for payment success page access!' as message;
