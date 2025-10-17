-- Create homepage_settings table for storing homepage configurations
CREATE TABLE IF NOT EXISTS homepage_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hero_section JSONB,
    image_slider JSONB,
    featured_grid JSONB,
    best_sellers JSONB,
    featured_artwork JSONB,
    categories JSONB,
    trending_collections JSONB,
    stats JSONB,
    newsletter JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for homepage_settings
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read homepage settings
CREATE POLICY "Allow authenticated users to read homepage settings" ON homepage_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert homepage settings
CREATE POLICY "Allow authenticated users to insert homepage settings" ON homepage_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update homepage settings
CREATE POLICY "Allow authenticated users to update homepage settings" ON homepage_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete homepage settings
CREATE POLICY "Allow authenticated users to delete homepage settings" ON homepage_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_homepage_settings_created_at ON homepage_settings(created_at DESC);

-- Add comment to the table
COMMENT ON TABLE homepage_settings IS 'Stores homepage configuration settings for the admin panel';
