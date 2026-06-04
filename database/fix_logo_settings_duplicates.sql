-- Fix Logo Settings Duplicates
-- This script ensures only one active logo setting exists

-- Step 1: Check current active settings
SELECT id, created_at, is_active, logo_text 
FROM logo_settings 
WHERE is_active = true
ORDER BY created_at DESC;

-- Step 2: Keep only the most recent active setting
-- Deactivate all but the newest one
UPDATE logo_settings
SET is_active = false
WHERE id NOT IN (
    SELECT id 
    FROM logo_settings 
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1
);

-- Step 3: Verify only one active setting remains
SELECT id, created_at, is_active, logo_text, logo_url
FROM logo_settings 
WHERE is_active = true;

-- Step 4: Show all settings for reference
SELECT id, created_at, is_active, logo_text, logo_url
FROM logo_settings 
ORDER BY created_at DESC;

-- Success message
SELECT 'Logo settings cleaned up successfully!' as status;
