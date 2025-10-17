-- Create favorites table for user product favorites
-- This table stores user's favorite products

-- Drop table if exists
DROP TABLE IF EXISTS favorites CASCADE;

-- Create favorites table
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of user and product
    UNIQUE(user_id, product_id)
);re

-- Create indexes for better performance
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at);

-- Add comments
COMMENT ON TABLE favorites IS 'User favorite products';
COMMENT ON COLUMN favorites.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN favorites.product_id IS 'Reference to products table';
COMMENT ON COLUMN favorites.created_at IS 'When the product was added to favorites';

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Users can update their own favorites (for future use)
CREATE POLICY "Users can update their own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_favorites_updated_at
    BEFORE UPDATE ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_favorites_updated_at();

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'favorites' 
ORDER BY ordinal_position;
