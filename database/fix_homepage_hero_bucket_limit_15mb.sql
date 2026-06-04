-- Fix homepage hero image bucket size limit to 15MB
-- Run this in Supabase SQL Editor for your project.

-- 15 MB in bytes
DO $$
DECLARE
  target_limit bigint := 15728640;
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'homepage-hero-images') THEN
    UPDATE storage.buckets
    SET file_size_limit = target_limit
    WHERE id = 'homepage-hero-images';
  ELSE
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'homepage-hero-images',
      'homepage-hero-images',
      true,
      target_limit,
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
  END IF;
END $$;

-- Verify the current limit
SELECT id, name, file_size_limit
FROM storage.buckets
WHERE id = 'homepage-hero-images';
