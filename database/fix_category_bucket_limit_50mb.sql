-- Fix category image bucket size limit to 50MB
-- Run this in Supabase SQL Editor for your project.

-- 50 MB in bytes
DO $$
DECLARE
  target_limit bigint := 52428800;
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'category-images') THEN
    UPDATE storage.buckets
    SET file_size_limit = target_limit
    WHERE id = 'category-images';
  ELSE
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'category-images',
      'category-images',
      true,
      target_limit,
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
  END IF;
END $$;

-- Verify the current limit
SELECT id, name, file_size_limit
FROM storage.buckets
WHERE id = 'category-images';
