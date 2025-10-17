-- =====================================================
-- SIMPLE STORAGE RLS FIX (NO TABLE OWNERSHIP REQUIRED)
-- This script only creates policies and buckets without modifying table ownership
-- =====================================================

-- =====================================================
-- CREATE/UPDATE STORAGE BUCKETS (SAFE OPERATION)
-- =====================================================

-- Create or update all necessary buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('homepage-hero-images', 'homepage-hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-slider-images', 'homepage-slider-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-featured-grid', 'homepage-featured-grid', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-categories-images', 'homepage-categories-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-trending-images', 'homepage-trending-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- CREATE SIMPLE POLICIES (WITH ERROR HANDLING)
-- =====================================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow homepage hero uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow homepage slider uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow homepage featured uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow homepage categories uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow homepage trending uploads" ON storage.objects;

-- Create simple policies for homepage hero images
CREATE POLICY "Allow homepage hero uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'homepage-hero-images');

-- Create simple policies for homepage slider images  
CREATE POLICY "Allow homepage slider uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'homepage-slider-images');

-- Create simple policies for homepage featured grid images
CREATE POLICY "Allow homepage featured uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'homepage-featured-grid');

-- Create simple policies for homepage categories images
CREATE POLICY "Allow homepage categories uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'homepage-categories-images');

-- Create simple policies for homepage trending images
CREATE POLICY "Allow homepage trending uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'homepage-trending-images');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if buckets exist
SELECT id, name, public FROM storage.buckets WHERE id LIKE 'homepage%';

-- Check if policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%homepage%';
