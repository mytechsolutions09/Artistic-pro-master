-- Diagnostic script to identify the status column issue
-- Run this in your Supabase SQL editor to see what's happening

-- 1. Check if the categories table exists and what columns it has
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'categories'
ORDER BY ordinal_position;

-- 2. Check if there are multiple categories tables in different schemas
SELECT 
    table_schema,
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_name = 'categories'
ORDER BY table_schema, table_name, ordinal_position;

-- 3. Check the exact table structure
\d+ public.categories;

-- 4. Check if the table was created successfully
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'categories';

-- 5. Check if there are any views that might be causing issues
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE '%categor%';

-- 6. Check if the status column actually exists
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'categories' 
  AND column_name = 'status';
