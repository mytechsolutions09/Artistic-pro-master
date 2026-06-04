-- =====================================================
-- FIX COMMISSIONED ART RLS POLICIES
-- Safe to run multiple times
-- =====================================================

-- Drop ALL existing policies (including any with different names)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'commissioned_art'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON commissioned_art', r.policyname);
    END LOOP;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE commissioned_art ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies

-- Policy 1: Allow authenticated users to insert commissions
CREATE POLICY "Allow authenticated users to insert commissions"
    ON commissioned_art
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 2: Allow authenticated users to read all commissions
CREATE POLICY "Allow authenticated users to read commissions"
    ON commissioned_art
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Allow authenticated users to update commissions
CREATE POLICY "Allow authenticated users to update commissions"
    ON commissioned_art
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete commissions
CREATE POLICY "Allow authenticated users to delete commissions"
    ON commissioned_art
    FOR DELETE
    TO authenticated
    USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies for commissioned_art have been updated successfully!';
    RAISE NOTICE 'You can now create, read, update, and delete commissions from the admin panel.';
END $$;

