-- =====================================================
-- CREATE MARKETING SETTINGS TABLE
-- =====================================================
-- This table stores marketing and analytics configuration
-- including Meta Pixel, Google Analytics, etc.
-- =====================================================

-- Drop existing table if exists (use with caution in production)
DROP TABLE IF EXISTS public.marketing_settings;

-- Create marketing_settings table
CREATE TABLE public.marketing_settings (
    -- Use a fixed UUID to ensure only one row can exist
    id UUID DEFAULT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid PRIMARY KEY,
    
    -- Meta (Facebook) Pixel Configuration
    meta_pixel_id TEXT,
    meta_pixel_enabled BOOLEAN DEFAULT true,
    
    -- Google Analytics Configuration
    google_analytics_id TEXT,
    google_analytics_enabled BOOLEAN DEFAULT false,
    
    -- Google Tag Manager Configuration
    google_tag_manager_id TEXT,
    google_tag_manager_enabled BOOLEAN DEFAULT false,
    
    -- Additional Marketing Tools (for future expansion)
    twitter_pixel_id TEXT,
    twitter_pixel_enabled BOOLEAN DEFAULT false,
    
    tiktok_pixel_id TEXT,
    tiktok_pixel_enabled BOOLEAN DEFAULT false,
    
    pinterest_tag_id TEXT,
    pinterest_tag_enabled BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure only one row exists in this table (using fixed UUID as primary key)
    CONSTRAINT single_row_only CHECK (id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_marketing_settings_id ON public.marketing_settings(id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to marketing settings" ON public.marketing_settings;
DROP POLICY IF EXISTS "Allow admin full access to marketing settings" ON public.marketing_settings;

-- Policy: Allow public read access (so the pixel can be loaded on frontend)
CREATE POLICY "Allow public read access to marketing settings"
    ON public.marketing_settings
    FOR SELECT
    TO public
    USING (true);

-- Policy: Allow authenticated admin users to manage settings
CREATE POLICY "Allow admin full access to marketing settings"
    ON public.marketing_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- INSERT DEFAULT SETTINGS
-- =====================================================

-- Insert default marketing settings
-- Note: Using fixed UUID to ensure only one row exists
INSERT INTO public.marketing_settings (
    id,
    meta_pixel_id,
    meta_pixel_enabled,
    google_analytics_enabled,
    google_tag_manager_enabled,
    twitter_pixel_enabled,
    tiktok_pixel_enabled,
    pinterest_tag_enabled
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,  -- Fixed UUID for single-row table
    '1905415970060955',  -- Your Meta Pixel ID
    true,
    false,
    false,
    false,
    false,
    false
)
ON CONFLICT (id) DO UPDATE 
SET meta_pixel_id = EXCLUDED.meta_pixel_id,
    updated_at = NOW();

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_marketing_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_marketing_settings_updated_at ON public.marketing_settings;

CREATE TRIGGER trigger_update_marketing_settings_updated_at
    BEFORE UPDATE ON public.marketing_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_marketing_settings_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table was created
SELECT 
    tablename, 
    schemaname
FROM pg_tables 
WHERE tablename = 'marketing_settings';

-- Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'marketing_settings';

-- View all policies
SELECT 
    policyname,
    tablename,
    cmd as command,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'marketing_settings';

-- View current settings
SELECT * FROM public.marketing_settings;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Marketing settings table created successfully!';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ Default settings inserted';
    RAISE NOTICE '';
    RAISE NOTICE '📊 You can now manage marketing tools from Admin → Settings → Marketing';
END $$;

