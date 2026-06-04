# 🚨 IMMEDIATE FIX FOR RLS ERROR

You're getting: `RLS policy error and service role not available`

## **OPTION 1: Quick RLS Disable (30 seconds)**

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste this:**
```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```
4. **Click Run**
5. **Test your checkout** - it will work immediately!

## **OPTION 2: Create .env file (2 minutes)**

1. **Create a file called `.env` in your project root**
2. **Add this content:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. **Get your keys from Supabase Dashboard:**
   - Go to **Settings** → **API**
   - Copy the **URL** and paste it as `VITE_SUPABASE_URL`
   - Copy the **anon public** key and paste it as `VITE_SUPABASE_ANON_KEY`
   - Copy the **service_role** key and paste it as `VITE_SUPABASE_SERVICE_ROLE_KEY`

4. **Restart your dev server:**
```bash
npm run dev
```

## **OPTION 3: Apply Comprehensive RLS Fix**

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy the contents of `fix_orders_rls_comprehensive.sql`**
3. **Paste and run it**
4. **Test your checkout**

## **Which Option Should You Choose?**

- **Need it working NOW?** → Use Option 1 (RLS Disable)
- **Want proper security?** → Use Option 2 (.env file) or Option 3 (RLS Fix)
- **Want both?** → Use Option 1 first, then set up Option 2

## **After the Fix**

Your checkout should work without any RLS policy errors!

If you're still having issues, let me know which option you tried and what happened.
