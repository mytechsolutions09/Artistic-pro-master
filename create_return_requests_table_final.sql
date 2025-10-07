-- Create return_requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL,
    product_id UUID,
    product_title TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    customer_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
    refund_amount DECIMAL(10,2),
    refund_method TEXT,
    admin_notes TEXT,
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_requested_by ON public.return_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_return_requests_requested_at ON public.return_requests(requested_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own return requests
CREATE POLICY "Users can view own return requests" ON public.return_requests
    FOR SELECT USING (auth.uid()::text = requested_by OR auth.role() = 'service_role');

-- Users can create return requests
CREATE POLICY "Users can create return requests" ON public.return_requests
    FOR INSERT WITH CHECK (auth.uid()::text = requested_by OR auth.role() = 'service_role');

-- Users can update their own return requests (limited fields)
CREATE POLICY "Users can update own return requests" ON public.return_requests
    FOR UPDATE USING (auth.uid()::text = requested_by OR auth.role() = 'service_role')
    WITH CHECK (auth.uid()::text = requested_by OR auth.role() = 'service_role');

-- Admins can do everything (service_role has full access)
CREATE POLICY "Admins have full access" ON public.return_requests
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_return_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_return_requests_updated_at
    BEFORE UPDATE ON public.return_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_return_requests_updated_at();

-- Grant permissions
GRANT ALL ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;
