-- Setup Supabase Storage Bucket for Review Images
-- This script creates the storage bucket and necessary policies for review images

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

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload review images
CREATE POLICY "Users can upload review images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow authenticated users to update their own review images
CREATE POLICY "Users can update their own review images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow authenticated users to delete their own review images
CREATE POLICY "Users can delete their own review images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'review-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow everyone to view review images (public read)
CREATE POLICY "Anyone can view review images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'review-images');

-- Policy 5: Allow service role to manage all review images (for admin operations)
CREATE POLICY "Service role can manage all review images" ON storage.objects
FOR ALL TO service_role
USING (bucket_id = 'review-images');

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
