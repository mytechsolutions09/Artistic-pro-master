-- Temporarily disable RLS for return_requests table for testing
-- This allows all authenticated users to access the table

-- Disable RLS temporarily
ALTER TABLE public.return_requests DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'return_requests';

-- Note: Re-enable RLS later with proper policies after testing
-- ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
