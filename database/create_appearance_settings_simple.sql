-- Create appearance_settings table for storing theme colors and images
CREATE TABLE IF NOT EXISTS appearance_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  theme_colors JSONB DEFAULT '{
    "lightPink": "#fce7f3",
    "pink": "#ec4899", 
    "darkPink": "#be185d"
  }',
  left_side_image TEXT DEFAULT '',
  left_side_image_type TEXT DEFAULT 'illustration' CHECK (left_side_image_type IN ('illustration', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO appearance_settings (id, theme_colors, left_side_image, left_side_image_type)
VALUES (1, 
  '{
    "lightPink": "#fce7f3",
    "pink": "#ec4899",
    "darkPink": "#be185d"
  }',
  '',
  'illustration'
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE appearance_settings ENABLE ROW LEVEL SECURITY;

-- Create simple policy for admin access (using service role or bypassing RLS for now)
CREATE POLICY "Allow all operations on appearance_settings" ON appearance_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create public bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Create simple storage policies
DROP POLICY IF EXISTS "Public can view auth images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload auth images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update auth images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete auth images" ON storage.objects;

-- Allow public to view images
CREATE POLICY "Public can view auth images" ON storage.objects
  FOR SELECT USING (bucket_id = 'public' AND name LIKE 'auth-images/%');

-- Allow authenticated users to upload/update/delete
CREATE POLICY "Authenticated users can manage auth images" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
  ) WITH CHECK (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
  );
