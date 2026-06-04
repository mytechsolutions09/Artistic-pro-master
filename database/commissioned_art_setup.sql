-- =====================================================
-- COMMISSIONED ART MANAGEMENT SYSTEM
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- Create commissioned_art table
CREATE TABLE IF NOT EXISTS commissioned_art (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Commission Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    art_type VARCHAR(50) DEFAULT 'painting' CHECK (art_type IN ('painting', 'digital', 'sculpture', 'mixed_media', 'illustration', 'custom')),
    dimensions VARCHAR(100), -- e.g., "24x36 inches"
    medium VARCHAR(100), -- e.g., "Oil on Canvas", "Digital Art"
    reference_images TEXT[], -- Array of image URLs
    
    -- Pricing and Budget
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    quoted_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    deposit_paid DECIMAL(10,2) DEFAULT 0,
    
    -- Status and Timeline
    status VARCHAR(20) DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'quoted', 'accepted', 'in_progress', 'review', 'completed', 'delivered', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    requested_delivery_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    
    -- Progress Tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    work_in_progress_images TEXT[], -- Array of WIP image URLs
    final_artwork_images TEXT[], -- Array of final artwork URLs
    
    -- Communication
    notes TEXT,
    admin_notes TEXT, -- Internal notes for admin only
    revision_count INTEGER DEFAULT 0,
    revision_limit INTEGER DEFAULT 2,
    
    -- Payment Details
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'partially_paid', 'fully_paid', 'refunded')),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    
    -- Additional Information
    tags JSONB DEFAULT '[]', -- Store tags as JSON array
    featured BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_commissioned_art_status ON commissioned_art(status);
CREATE INDEX IF NOT EXISTS idx_commissioned_art_customer_email ON commissioned_art(customer_email);
CREATE INDEX IF NOT EXISTS idx_commissioned_art_customer_id ON commissioned_art(customer_id);
CREATE INDEX IF NOT EXISTS idx_commissioned_art_created_at ON commissioned_art(created_at);
CREATE INDEX IF NOT EXISTS idx_commissioned_art_priority ON commissioned_art(priority);
CREATE INDEX IF NOT EXISTS idx_commissioned_art_payment_status ON commissioned_art(payment_status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_commissioned_art_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_commissioned_art_timestamp ON commissioned_art;

-- Create trigger
CREATE TRIGGER trigger_update_commissioned_art_timestamp
    BEFORE UPDATE ON commissioned_art
    FOR EACH ROW
    EXECUTE FUNCTION update_commissioned_art_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE commissioned_art ENABLE ROW LEVEL SECURITY;

-- Create policies for commissioned_art
-- Allow authenticated users full access to manage commissions
-- (In production, you might want to add admin-specific checks)

-- Policy 1: Allow authenticated users to insert commissions
CREATE POLICY "Allow authenticated users to insert commissions"
    ON commissioned_art
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 2: Allow authenticated users to read all commissions
CREATE POLICY "Allow authenticated users to read commissions"
    ON commissioned_art
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Allow authenticated users to update commissions
CREATE POLICY "Allow authenticated users to update commissions"
    ON commissioned_art
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete commissions
CREATE POLICY "Allow authenticated users to delete commissions"
    ON commissioned_art
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample data
INSERT INTO commissioned_art (customer_name, customer_email, customer_phone, title, description, art_type, dimensions, medium, budget_min, budget_max, status, priority, requested_delivery_date)
VALUES 
    ('Ravi Kumar', 'ravi.kumar@example.com', '+91-9876543210', 'Custom Family Portrait', 'A realistic oil painting of our family of 4 with pets', 'painting', '30x40 inches', 'Oil on Canvas', 15000, 25000, 'inquiry', 'normal', CURRENT_DATE + INTERVAL '30 days'),
    ('Priya Sharma', 'priya.sharma@example.com', '+91-9876543211', 'Modern Abstract Art', 'Large abstract piece for living room in blue and gold tones', 'painting', '48x60 inches', 'Acrylic on Canvas', 30000, 50000, 'quoted', 'high', CURRENT_DATE + INTERVAL '45 days'),
    ('Amit Patel', 'amit.patel@example.com', '+91-9876543212', 'Pet Portrait', 'Digital portrait of my golden retriever', 'digital', '16x20 inches', 'Digital Art', 5000, 10000, 'in_progress', 'normal', CURRENT_DATE + INTERVAL '15 days'),
    ('Sneha Reddy', 'sneha.reddy@example.com', '+91-9876543213', 'Wedding Illustration', 'Custom illustration for wedding invitation', 'illustration', '12x18 inches', 'Watercolor', 8000, 15000, 'completed', 'urgent', CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Commissioned Art Management System setup completed successfully!';
END $$;

