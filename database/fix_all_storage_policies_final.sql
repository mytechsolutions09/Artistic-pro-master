-- =====================================================
-- COMPREHENSIVE STORAGE POLICY FIX
-- This fixes both auth images AND homepage uploads
-- =====================================================

-- =====================================================
-- DROP ALL EXISTING POLICIES TO AVOID CONFLICTS
-- =====================================================

-- Drop all existing storage policies
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
-- CREATE COMPREHENSIVE POLICIES FOR ALL BUCKETS
-- =====================================================

-- Policy 1: Allow public read access to ALL storage objects
CREATE POLICY "Public read access to all storage" ON storage.objects
FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to upload to ANY bucket
CREATE POLICY "Authenticated users can upload anywhere" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update files in ANY bucket
CREATE POLICY "Authenticated users can update anywhere" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete files in ANY bucket
CREATE POLICY "Authenticated users can delete anywhere" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');

-- Policy 5: Allow service role full access
CREATE POLICY "Service role can manage all storage" ON storage.objects
FOR ALL TO service_role
USING (true);

-- =====================================================
-- ENSURE ALL BUCKETS EXIST AND ARE PUBLIC
-- =====================================================

-- Create/update all necessary buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    -- Homepage buckets
    ('homepage-hero-images', 'homepage-hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-slider-images', 'homepage-slider-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-featured-grid', 'homepage-featured-grid', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-categories-images', 'homepage-categories-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('homepage-trending-images', 'homepage-trending-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    
    -- Other buckets
    ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('category-images', 'category-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('main-images', 'main-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('product-pdfs', 'product-pdfs', true, 52428800, ARRAY['application/pdf']),
    ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
    ('auth-images', 'auth-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('public', 'public', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all buckets exist
SELECT id, name, public FROM storage.buckets ORDER BY id;

-- Verify policies were created
SELECT policyname, cmd, roles FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Success message
SELECT 'All storage policies have been fixed! Both auth images and homepage uploads should now work.' as status;
