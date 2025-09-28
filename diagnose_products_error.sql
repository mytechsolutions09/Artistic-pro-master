-- Diagnostic script to identify the products/categories issue
-- Run this in your Supabase SQL editor to see what's happening

-- 1. Check if the products table exists and what columns it has
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. Check if the categories table exists and what columns it has
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

-- 3. Check if there are multiple categories tables in different schemas
SELECT
    table_schema,
    table_name,
    column_name
FROM information_schema.columns
WHERE table_name = 'categories'
ORDER BY table_schema, table_name, ordinal_position;

-- 4. Check if the count column actually exists in categories
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'categories'
  AND column_name = 'count';

-- 5. Check if the update_category_count function exists
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_category_count'
  AND routine_schema = 'public';

-- 6. Check if the trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'update_category_count_trigger'
  AND trigger_schema = 'public';

-- 7. Check the exact table structure
\d+ public.products;
\d+ public.categories;

-- 8. Check if there are any views that might be causing issues
SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND (table_name LIKE '%product%' OR table_name LIKE '%categor%');
