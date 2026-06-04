-- Simple Logo Storage Setup for Supabase
-- Run this in Supabase SQL Editor
-- Note: Create the storage bucket manually in Supabase UI first

-- Step 1: Create logo settings table
CREATE TABLE IF NOT EXISTS logo_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Logo configuration
    logo_url TEXT,
    logo_text TEXT DEFAULT 'Lurevi',
    logo_color TEXT DEFAULT '#F0B0B0',
    background_color TEXT DEFAULT '#FFFFFF',
    show_underline BOOLEAN DEFAULT true,
    underline_color TEXT DEFAULT '#F0B0B0',
    font_size INTEGER DEFAULT 42,
    font_family TEXT DEFAULT 'Brush Script MT',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id)
);

-- Step 2: Enable RLS on logo_settings table
ALTER TABLE logo_settings ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access to active logo settings" ON logo_settings;
DROP POLICY IF EXISTS "Authenticated users can manage logo settings" ON logo_settings;

-- Step 4: Create RLS policies for logo_settings
CREATE POLICY "Public read access to active logo settings" ON logo_settings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage logo settings" ON logo_settings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 5: Insert default logo settings
INSERT INTO logo_settings (
    logo_url,
    logo_text,
    logo_color,
    background_color,
    show_underline,
    underline_color,
    font_size,
    font_family,
    is_active
) VALUES (
    '/lurevi-logo.svg',
    'Lurevi',
    '#F0B0B0',
    '#FFFFFF',
    true,
    '#F0B0B0',
    42,
    'Brush Script MT',
    true
) ON CONFLICT DO NOTHING;

-- Step 6: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_logo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_logo_settings_updated_at ON logo_settings;
CREATE TRIGGER update_logo_settings_updated_at
    BEFORE UPDATE ON logo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_logo_settings_updated_at();

-- Success message
SELECT 'Logo settings table created successfully!' as status;
