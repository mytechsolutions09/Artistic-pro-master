-- =====================================================
-- NORMAL ITEMS TABLE SETUP
-- =====================================================
-- This script creates the normal_items table for managing
-- normal items that can be displayed on the /normal page
-- =====================================================

-- Create normal_items table
CREATE TABLE IF NOT EXISTS normal_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    main_image VARCHAR(255), -- Main item image URL
    price INTEGER NOT NULL,
    original_price INTEGER,
    discount_percentage INTEGER DEFAULT 0,
    slug VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    tags TEXT[] DEFAULT '{}',
    item_details JSONB DEFAULT '{}',
    delivery_info JSONB DEFAULT '{}',
    did_you_know JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_normal_items_slug ON normal_items(slug);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_normal_items_status ON normal_items(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_normal_items_created_at ON normal_items(created_at DESC);

-- Enable Row Level Security
ALTER TABLE normal_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active items
CREATE POLICY "Anyone can view active normal items"
    ON normal_items
    FOR SELECT
    USING (status = 'active');

-- Policy: Authenticated users can read all items (for admin)
CREATE POLICY "Authenticated users can view all normal items"
    ON normal_items
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert normal items"
    ON normal_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Authenticated users can update normal items"
    ON normal_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Only authenticated users can delete
CREATE POLICY "Authenticated users can delete normal items"
    ON normal_items
    FOR DELETE
    TO authenticated
    USING (true);

-- Add comment
COMMENT ON TABLE normal_items IS 'Stores normal items displayed on the /normal page';
