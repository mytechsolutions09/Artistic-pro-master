-- Create public bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete auth images" ON storage.objects;

-- Create storage policies for public bucket auth images
CREATE POLICY "Public can view auth images" ON storage.objects
  FOR SELECT USING (bucket_id = 'public' AND name LIKE 'auth-images/%');

CREATE POLICY "Admin can upload auth images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

CREATE POLICY "Admin can update auth images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );

CREATE POLICY "Admin can delete auth images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
    AND EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'arpitkanotra@ymail.com'
    )
  );
