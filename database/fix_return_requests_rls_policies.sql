-- Fix RLS policies for return_requests table
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Users can create return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Users can update own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins have full access" ON public.return_requests;
DROP POLICY IF EXISTS "Admins can delete return requests" ON public.return_requests;

-- Temporarily disable RLS to fix the issue
ALTER TABLE public.return_requests DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Create new, more permissive policies
-- Allow authenticated users to view all return requests (for now)
CREATE POLICY "Allow authenticated users to view returns" ON public.return_requests
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to create return requests
CREATE POLICY "Allow authenticated users to create returns" ON public.return_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to update return requests
CREATE POLICY "Allow authenticated users to update returns" ON public.return_requests
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow service role to delete return requests
CREATE POLICY "Allow service role to delete returns" ON public.return_requests
    FOR DELETE USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;

-- Verify RLS is enabled
ALTER TABLE public.return_requests FORCE ROW LEVEL SECURITY;
