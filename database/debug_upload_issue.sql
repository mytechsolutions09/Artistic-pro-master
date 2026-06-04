-- =====================================================
-- DEBUG UPLOAD ISSUE
-- This script helps diagnose why uploads are still failing
-- =====================================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- List all policies on storage.objects
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- Check if homepage buckets exist
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id LIKE 'homepage%'
ORDER BY id;

-- Check current user and role
SELECT current_user, current_role, session_user;

-- Check if user is authenticated (this will show in the logs)
SELECT auth.uid(), auth.role();

-- List all buckets
SELECT id, name, public FROM storage.buckets ORDER BY id;
