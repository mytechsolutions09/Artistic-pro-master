-- Fix homepage_settings RLS policies to allow public read access
-- This allows unauthenticated users to see custom homepage settings

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to read homepage settings" ON homepage_settings;

-- Create a new policy that allows public read access
CREATE POLICY "Allow public read access to homepage settings" ON homepage_settings
    FOR SELECT USING (true);

-- Keep the existing policies for authenticated users to manage settings
-- (These should already exist, but let's ensure they're there)

-- Policy for authenticated users to insert homepage settings
DROP POLICY IF EXISTS "Allow authenticated users to insert homepage settings" ON homepage_settings;
CREATE POLICY "Allow authenticated users to insert homepage settings" ON homepage_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update homepage settings
DROP POLICY IF EXISTS "Allow authenticated users to update homepage settings" ON homepage_settings;
CREATE POLICY "Allow authenticated users to update homepage settings" ON homepage_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete homepage settings
DROP POLICY IF EXISTS "Allow authenticated users to delete homepage settings" ON homepage_settings;
CREATE POLICY "Allow authenticated users to delete homepage settings" ON homepage_settings
    FOR DELETE USING (auth.role() = 'authenticated');
