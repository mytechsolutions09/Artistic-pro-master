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

-- Public can view auth images
CREATE POLICY "Public can view auth images" ON storage.objects
  FOR SELECT USING (bucket_id = 'auth-images');

-- Admin can upload auth images (applied to authenticated users)
CREATE POLICY "Admin can upload auth images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'auth-images' 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

-- Admin can update auth images (applied to authenticated users)
CREATE POLICY "Admin can update auth images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'auth-images' 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

-- Admin can delete auth images (applied to authenticated users)
CREATE POLICY "Admin can delete auth images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'auth-images' 
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

-- Create folder structure for organized storage
-- Note: Folders are created automatically when files are uploaded to paths like 'auth-images/backgrounds/'
