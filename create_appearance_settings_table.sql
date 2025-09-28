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

-- Create policy for admin access only
CREATE POLICY "Admin can manage appearance settings" ON appearance_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

-- Create dedicated bucket for authentication page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('auth-images', 'auth-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete auth images" ON storage.objects;

-- Create storage policies for auth-images bucket
CREATE POLICY "Public can view auth images" ON storage.objects
  FOR SELECT USING (bucket_id = 'auth-images');

CREATE POLICY "Admin can upload auth images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'auth-images' 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

CREATE POLICY "Admin can update auth images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'auth-images' 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

CREATE POLICY "Admin can delete auth images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'auth-images' 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );
