-- =====================================================
-- PERMISSIVE STORAGE RLS FIX
-- This script creates permissive policies that allow all authenticated users
-- to upload, update, and delete files in all storage buckets
-- =====================================================

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP ALL EXISTING STORAGE POLICIES TO AVOID CONFLICTS
-- =====================================================

-- Drop all existing policies on storage.objects
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- =====================================================
-- CREATE PERMISSIVE POLICIES FOR ALL BUCKETS
-- =====================================================

-- Policy 1: Allow public read access to all storage objects
CREATE POLICY "Public read access to all storage objects" ON storage.objects
FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to upload to any bucket
CREATE POLICY "Authenticated users can upload to any bucket" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update files in any bucket
CREATE POLICY "Authenticated users can update files in any bucket" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete files in any bucket
CREATE POLICY "Authenticated users can delete files in any bucket" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');

-- Policy 5: Allow service role full access to all storage objects
CREATE POLICY "Service role can manage all storage objects" ON storage.objects
FOR ALL TO service_role
USING (true);

-- =====================================================
-- ENSURE ALL BUCKETS EXIST AND ARE PUBLIC
-- =====================================================

-- List of all buckets that should exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('category-images', 'category-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('main-images', 'main-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('product-pdfs', 'product-pdfs', true, 52428800, ARRAY['application/pdf']),
    ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
    ('homepage-hero-images', 'homepage-hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-slider-images', 'homepage-slider-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-featured-grid', 'homepage-featured-grid', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-categories-images', 'homepage-categories-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-trending-images', 'homepage-trending-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('auth-images', 'auth-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('public', 'public', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all buckets exist and are public
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
ORDER BY id;

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Storage RLS policies have been fixed! All authenticated users can now upload to any bucket.' as status;
