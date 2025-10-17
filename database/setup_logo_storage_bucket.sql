-- Logo Storage Bucket Setup for Supabase
-- This script creates a dedicated bucket for logo storage with proper RLS policies

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'logos',
    'logos',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for logos bucket if they exist
DROP POLICY IF EXISTS "Public read access to logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to logos" ON storage.objects;

-- Create policy for public read access to logos
CREATE POLICY "Public read access to logos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'logos'
    );

-- Create policy for authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'logos' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to update logos
CREATE POLICY "Authenticated users can update logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'logos' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for authenticated users to delete logos
CREATE POLICY "Authenticated users can delete logos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'logos' AND 
        auth.uid() IS NOT NULL
    );

-- Create policy for service role full access (for admin operations)
CREATE POLICY "Service role full access to logos" ON storage.objects
    FOR ALL USING (
        bucket_id = 'logos' AND 
        auth.role() = 'service_role'
    );

-- Create logo settings table if it doesn't exist
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

-- Enable RLS on logo_settings table
ALTER TABLE logo_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for logo_settings
DROP POLICY IF EXISTS "Public read access to active logo settings" ON logo_settings;
DROP POLICY IF EXISTS "Authenticated users can manage logo settings" ON logo_settings;
DROP POLICY IF EXISTS "Service role full access to logo settings" ON logo_settings;

-- Policy for public read access to active logo settings
CREATE POLICY "Public read access to active logo settings" ON logo_settings
    FOR SELECT USING (
        is_active = true
    );

-- Policy for authenticated users to manage logo settings
CREATE POLICY "Authenticated users can manage logo settings" ON logo_settings
    FOR ALL USING (
        auth.uid() IS NOT NULL
    );

-- Policy for service role full access
CREATE POLICY "Service role full access to logo settings" ON logo_settings
    FOR ALL USING (
        auth.role() = 'service_role'
    );

-- Insert default logo settings
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_logo_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_logo_settings_updated_at ON logo_settings;
CREATE TRIGGER update_logo_settings_updated_at
    BEFORE UPDATE ON logo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_logo_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON logo_settings TO authenticated;

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Logo storage bucket setup completed successfully!';
    RAISE NOTICE 'Created bucket: logos';
    RAISE NOTICE 'File size limit: 5MB';
    RAISE NOTICE 'Allowed types: JPEG, PNG, WebP, SVG, GIF';
    RAISE NOTICE 'Created logo_settings table with default settings';
END $$;
