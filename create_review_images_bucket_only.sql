-- Create Review Images Bucket Only (No Policies)
-- This script only creates the bucket and functions, without storage policies
-- Use this if you get permission errors with the full setup script

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

-- Create a function to generate unique file names for review images
CREATE OR REPLACE FUNCTION generate_review_image_filename()
RETURNS TEXT AS $$
BEGIN
  RETURN 'review_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
END;
$$ LANGUAGE plpgsql;

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

-- Add comments
COMMENT ON FUNCTION generate_review_image_filename() IS 'Generates unique filenames for review images';
COMMENT ON FUNCTION cleanup_orphaned_review_images() IS 'Cleans up review images that are no longer referenced in reviews';

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Review images bucket created successfully!';
  RAISE NOTICE 'Bucket name: review-images';
  RAISE NOTICE 'Public access: enabled';
  RAISE NOTICE 'File size limit: 5MB';
  RAISE NOTICE 'Allowed types: JPEG, PNG, GIF, WebP, SVG';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Storage > Policies';
  RAISE NOTICE '2. Enable RLS on storage.objects table';
  RAISE NOTICE '3. Create the storage policies manually (see MANUAL_SUPABASE_SETUP.md)';
  RAISE NOTICE '4. Test the upload functionality';
END $$;
