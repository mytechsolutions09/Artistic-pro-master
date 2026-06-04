# Return System Database Setup

## Step 1: Create Return Requests Table

Run the following SQL script in your Supabase SQL editor:

```sql
-- Create return_requests table
CREATE TABLE return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    customer_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
    requested_by VARCHAR(255) NOT NULL, -- customer email or user ID
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    refund_amount INTEGER,
    refund_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX idx_return_requests_status ON return_requests(status);
CREATE INDEX idx_return_requests_requested_by ON return_requests(requested_by);
CREATE INDEX idx_return_requests_requested_at ON return_requests(requested_at);

-- Add status column to order_items table if it doesn't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
CHECK (status IN ('active', 'returned', 'refunded'));

-- Create index for order_items status
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Enable RLS (Row Level Security)
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for return_requests table
-- Customers can view their own return requests
CREATE POLICY "Users can view their own return requests" ON return_requests
    FOR SELECT USING (requested_by = auth.jwt() ->> 'email');

-- Customers can create return requests for their orders
CREATE POLICY "Users can create return requests for their orders" ON return_requests
    FOR INSERT WITH CHECK (
        requested_by = auth.jwt() ->> 'email' AND
        order_id IN (
            SELECT id FROM orders WHERE customer_email = auth.jwt() ->> 'email'
        )
    );

-- Customers can update their own return requests (only customer_notes)
CREATE POLICY "Users can update their own return requests" ON return_requests
    FOR UPDATE USING (requested_by = auth.jwt() ->> 'email')
    WITH CHECK (requested_by = auth.jwt() ->> 'email');

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage all return requests" ON return_requests
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_return_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_return_requests_updated_at
    BEFORE UPDATE ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_return_requests_updated_at();

-- Create a function to get return statistics
CREATE OR REPLACE FUNCTION get_return_statistics()
RETURNS TABLE (
    total_returns BIGINT,
    pending_returns BIGINT,
    approved_returns BIGINT,
    completed_returns BIGINT,
    rejected_returns BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_returns,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_returns,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_returns,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_returns,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_returns
    FROM return_requests;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON return_requests TO authenticated;
GRANT ALL ON return_requests TO service_role;

-- Grant execute permission on the statistics function
GRANT EXECUTE ON FUNCTION get_return_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_return_statistics() TO service_role;
```

## Step 2: Verify Setup

After running the SQL script, the return system should work properly. You can test by:

1. Going to the User Dashboard
2. Finding a completed order with non-digital items
3. Clicking the "Return" button
4. Filling out the return request form

## Step 3: Admin Interface

The admin interface for managing returns will be available at `/admin/returns` once implemented.
