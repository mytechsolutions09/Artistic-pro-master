-- Setup Supabase Storage Bucket for Review Images (Fixed Version)
-- This script creates the storage bucket and necessary policies for review images
-- Note: Some operations may require superuser privileges

-- Create the review-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true, -- Public bucket so images can be accessed directly
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Enable RLS on the bucket (this might require superuser privileges)
-- If this fails, you may need to run it manually in the Supabase dashboard
DO $$
BEGIN
  -- Try to enable RLS, but don't fail if we don't have permissions
  BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS enabled on storage.objects table';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privileges to enable RLS. Please enable it manually in the Supabase dashboard.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not enable RLS: %', SQLERRM;
  END;
END $$;

-- Create policies (these might also require superuser privileges)
-- If these fail, you'll need to create them manually in the Supabase dashboard

-- Policy 1: Allow authenticated users to upload review images
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Users can upload review images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'review-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    RAISE NOTICE 'Upload policy created successfully';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Upload policy already exists';
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privileges to create upload policy. Please create it manually in the Supabase dashboard.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not create upload policy: %', SQLERRM;
  END;
END $$;

-- Policy 2: Allow authenticated users to update their own review images
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Users can update their own review images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'review-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    RAISE NOTICE 'Update policy created successfully';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Update policy already exists';
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privileges to create update policy. Please create it manually in the Supabase dashboard.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not create update policy: %', SQLERRM;
  END;
END $$;

-- Policy 3: Allow authenticated users to delete their own review images
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Users can delete their own review images" ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'review-images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
    RAISE NOTICE 'Delete policy created successfully';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Delete policy already exists';
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privileges to create delete policy. Please create it manually in the Supabase dashboard.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not create delete policy: %', SQLERRM;
  END;
END $$;

-- Policy 4: Allow everyone to view review images (public read)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Anyone can view review images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'review-images');
    RAISE NOTICE 'View policy created successfully';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'View policy already exists';
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privileges to create view policy. Please create it manually in the Supabase dashboard.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not create view policy: %', SQLERRM;
  END;
END $$;

-- Policy 5: Allow service role to manage all review images (for admin operations)
DO $$
BEGIN
  BEGIN
    CREATE POLICY "Service role can manage all review images" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'review-images');
    RAISE NOTICE 'Service role policy created successfully';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Service role policy already exists';
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Insufficient privileges to create service role policy. Please create it manually in the Supabase dashboard.';
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not create service role policy: %', SQLERRM;
  END;
END $$;

-- Create a function to generate unique file names for review images
CREATE OR REPLACE FUNCTION generate_review_image_filename()
RETURNS TEXT AS $$
BEGIN
  RETURN 'review_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate review image uploads
CREATE OR REPLACE FUNCTION validate_review_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to upload review images';
  END IF;
  
  -- Check file size (5MB limit)
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;
  
  -- Check file type
  IF NEW.metadata->>'mimetype' NOT IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml') THEN
    RAISE EXCEPTION 'Invalid file type. Only images are allowed';
  END IF;
  
  -- Ensure the file path includes the user ID
  IF (storage.foldername(NEW.name))[1] != auth.uid()::text THEN
    RAISE EXCEPTION 'File must be uploaded to user-specific folder';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate review image uploads
DROP TRIGGER IF EXISTS validate_review_image_upload_trigger ON storage.objects;
CREATE TRIGGER validate_review_image_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'review-images')
  EXECUTE FUNCTION validate_review_image_upload();

-- Create a function to clean up orphaned review images
CREATE OR REPLACE FUNCTION cleanup_orphaned_review_images()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  image_record RECORD;
BEGIN
  -- Find review images that are not referenced in any review
  FOR image_record IN
    SELECT o.name, o.id
    FROM storage.objects o
    WHERE o.bucket_id = 'review-images'
    AND NOT EXISTS (
      SELECT 1 
      FROM reviews r 
      WHERE r.images @> ARRAY[o.name]
    )
  LOOP
    -- Delete the orphaned image
    DELETE FROM storage.objects 
    WHERE id = image_record.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create an index for better performance on review images queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_review_images 
ON storage.objects (bucket_id, name) 
WHERE bucket_id = 'review-images';

-- Add comment to document the bucket setup
COMMENT ON TABLE storage.objects IS 'Storage objects including review images in review-images bucket';
COMMENT ON FUNCTION generate_review_image_filename() IS 'Generates unique filenames for review images';
COMMENT ON FUNCTION validate_review_image_upload() IS 'Validates review image uploads for size, type, and user permissions';
COMMENT ON FUNCTION cleanup_orphaned_review_images() IS 'Cleans up review images that are no longer referenced in reviews';

-- Display setup status
DO $$
BEGIN
  RAISE NOTICE 'Review images bucket setup completed!';
  RAISE NOTICE 'If you see any "insufficient privileges" messages above, please:';
  RAISE NOTICE '1. Go to your Supabase dashboard';
  RAISE NOTICE '2. Navigate to Storage > Policies';
  RAISE NOTICE '3. Create the policies manually using the SQL provided in the documentation';
  RAISE NOTICE '4. Enable RLS on the storage.objects table if not already enabled';
END $$;
