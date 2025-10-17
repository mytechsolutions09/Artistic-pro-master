-- Create more permissive policies for testing
-- This allows any authenticated user to upload to auth-images folder

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update auth images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete auth images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload auth images" ON storage.objects;

-- Create permissive storage policies for public bucket auth images
CREATE POLICY "Public can view auth images" ON storage.objects
  FOR SELECT USING (bucket_id = 'public' AND name LIKE 'auth-images/%');

-- Allow any authenticated user to upload (for testing)
CREATE POLICY "Authenticated users can upload auth images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
  );

-- Allow any authenticated user to update (for testing)
CREATE POLICY "Authenticated users can update auth images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
  );

-- Allow any authenticated user to delete (for testing)
CREATE POLICY "Authenticated users can delete auth images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'public' 
    AND name LIKE 'auth-images/%'
  );
