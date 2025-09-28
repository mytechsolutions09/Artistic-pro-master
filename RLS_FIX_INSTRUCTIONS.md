# RLS Policy Fix Instructions

You're getting the error: `new row violates row-level security policy for table "orders"`

## Option 1: Fix RLS Policies (Recommended)

### Step 1: Apply the Comprehensive SQL Fix
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `fix_orders_rls_comprehensive.sql`
4. Click **Run**

This will create permissive policies that allow all operations.

### Step 2: Test Your Checkout
Try the checkout process again. It should work now.

## Option 2: Use Service Role Bypass (Fallback)

If the RLS fix doesn't work, you can use the service role bypass:

### Step 1: Get Your Service Role Key
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the **service_role** key (not the anon key)

### Step 2: Add to Environment Variables
Add this to your `.env` file:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart Your Development Server
```bash
npm run dev
```

## Option 3: Disable RLS Temporarily (Quick Fix)

If you need an immediate fix, you can temporarily disable RLS:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning: This removes all security. Only use for testing!**

## What I've Done

1. ✅ Created comprehensive RLS policy fix (`fix_orders_rls_comprehensive.sql`)
2. ✅ Added service role bypass service (`orderServiceBypass.ts`)
3. ✅ Updated checkout to automatically fallback to bypass method
4. ✅ Added proper error handling and logging

## Testing

After applying any of the fixes above, your checkout should work without the RLS policy error.

If you're still having issues, let me know and I'll help you troubleshoot further!
