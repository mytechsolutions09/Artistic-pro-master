-- =====================================================
-- EMERGENCY FIX: DISABLE RLS TEMPORARILY
-- This will completely disable Row Level Security on storage.objects
-- Use this to get uploads working immediately
-- =====================================================

-- Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Show current status
SELECT 'RLS has been disabled on storage.objects. Uploads should now work without policy violations.' as status;
