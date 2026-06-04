# Database Setup for Products

This document explains how to set up the database for the products functionality in the Artistic Pro application.

## Prerequisites

1. A Supabase project set up
2. Supabase CLI installed (optional, for local development)
3. Access to your Supabase dashboard

## Environment Variables

Make sure you have these environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase_products_setup.sql`
4. Run the SQL script

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## What the Setup Creates

### Tables

1. **products** - Main products table with all product information
2. **categories** - Product categories
3. **reviews** - Product reviews and ratings
4. **orders** - Customer orders
5. **order_items** - Individual items in orders

### Key Features

- **Row Level Security (RLS)** enabled for all tables
- **Automatic triggers** for updating category counts and product ratings
- **Indexes** for optimal query performance
- **Sample data** included for testing

## Testing the Setup

After running the setup:

1. Start your application
2. Go to the admin panel (`/admin/products`)
3. Try to:
   - Create a new product
   - Edit an existing product
   - Delete a product
   - Toggle product status
   - Toggle featured status

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**
   - Make sure you ran the SQL setup script
   - Check that the tables were created in your Supabase dashboard

2. **Permission denied errors**
   - Ensure RLS policies are properly set up
   - Check that your user is authenticated

3. **Type errors**
   - Make sure you're using the latest version of the code
   - Check that all imports are correct

### Verification Queries

You can run these queries in your Supabase SQL editor to verify the setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('products', 'categories', 'reviews');

-- Check if sample data was inserted
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Next Steps

After setting up the database:

1. **Test CRUD operations** in the admin panel
2. **Add more products** through the interface
3. **Customize categories** as needed
4. **Set up authentication** if not already done

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment variables are correct
3. Ensure the database tables were created successfully
4. Check that RLS policies are in place
