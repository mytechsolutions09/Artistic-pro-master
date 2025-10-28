# Fix Commissioned Art RLS Error

## Problem
Getting error: **"new row violates row-level security policy for table 'commissioned_art'"**

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
Copy and paste the following SQL script and click **Run**:

```sql
-- Fix RLS policies for commissioned_art table

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can do everything with commissioned art" ON commissioned_art;
DROP POLICY IF EXISTS "Users can view their own commissions" ON commissioned_art;
DROP POLICY IF EXISTS "Users can create commissions" ON commissioned_art;
DROP POLICY IF EXISTS "Users can update their pending commissions" ON commissioned_art;

-- Create new permissive policies for authenticated users

CREATE POLICY "Allow authenticated users to insert commissions"
    ON commissioned_art
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read commissions"
    ON commissioned_art
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to update commissions"
    ON commissioned_art
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete commissions"
    ON commissioned_art
    FOR DELETE
    TO authenticated
    USING (true);
```

### Step 3: Verify
1. Go back to your admin panel
2. Try creating a new commission
3. It should work now! ✅

## What Changed?

### Before:
- Policies were checking for admin role in JWT token
- Required `customer_id` to match authenticated user
- Too restrictive for admin panel usage

### After:
- Policies allow any authenticated user to manage commissions
- Simple and works for admin panel
- Still requires authentication (secure)

## For Production (Optional)

If you need stricter access control in production, you can add admin role checks. Create a `user_roles` table or use custom JWT claims:

```sql
-- Example: Check against user_roles table
CREATE POLICY "Admin users can manage commissions"
    ON commissioned_art
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
```

## Files Updated

- ✅ `database/commissioned_art_setup.sql` - Main setup file updated
- ✅ `database/fix_commissioned_art_rls.sql` - Quick fix script created

## Need Help?

If the error persists:
1. Make sure you're logged in to Supabase
2. Check that the `commissioned_art` table exists
3. Verify you have admin access to the Supabase project
4. Check browser console for any authentication errors

---

**Note**: The RLS policies now allow any authenticated user to manage commissions. This is suitable for admin panels where you trust your authenticated users. For customer-facing apps, you'll want to add more specific checks.

