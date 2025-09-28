-- Quick fix for the "column count does not exist" error
-- Run this in your Supabase SQL editor

-- 1. First, let's check what we're working with
DO $$
BEGIN
    RAISE NOTICE 'Checking database structure...';
END $$;

-- 2. Add count column to categories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added count column to categories table';
    ELSE
        RAISE NOTICE 'Count column already exists in categories table';
    END IF;
END $$;

-- 3. Update the update_category_count function to be safer
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if count column exists before trying to update it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'count'
        AND table_schema = 'public'
    ) THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE categories SET count = count + 1 WHERE name = NEW.category;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE categories SET count = count - 1 WHERE name = OLD.category;
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.category != NEW.category THEN
                UPDATE categories SET count = count - 1 WHERE name = OLD.category;
                UPDATE categories SET count = count + 1 WHERE name = NEW.category;
            END IF;
            RETURN NEW;
        END IF;
    ELSE
        -- If count column doesn't exist, just return without error
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSIF TG_OP = 'UPDATE' THEN
            RETURN NEW;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 4. Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS update_category_count_trigger ON products;

CREATE TRIGGER update_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_count();

-- 5. Initialize count values for existing categories
UPDATE categories 
SET count = (
    SELECT COUNT(*) 
    FROM products 
    WHERE products.category = categories.name
);

-- 6. Display success message
DO $$
BEGIN
    RAISE NOTICE 'Products count error has been fixed!';
    RAISE NOTICE 'Categories table now has count column';
    RAISE NOTICE 'Trigger has been updated to handle missing count column safely';
    RAISE NOTICE 'Existing category counts have been initialized';
END $$;
