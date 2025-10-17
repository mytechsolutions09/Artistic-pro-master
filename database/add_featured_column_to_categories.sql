-- Add missing columns to categories table
-- This fixes the PGRST204 error: "Could not find the 'featured' column of 'categories' in the schema cache"
-- and the 42703 error: "column c.status does not exist"

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
        
        CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);
        
        RAISE NOTICE 'Added status column to categories table';
    ELSE
        RAISE NOTICE 'Status column already exists in categories table';
    END IF;
END $$;

-- Add featured column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'featured'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN featured BOOLEAN DEFAULT false;
        
        CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.categories(featured);
        
        RAISE NOTICE 'Added featured column to categories table';
    ELSE
        RAISE NOTICE 'Featured column already exists in categories table';
    END IF;
END $$;

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'tags'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.categories 
        ADD COLUMN tags TEXT[] DEFAULT '{}';
        
        RAISE NOTICE 'Added tags column to categories table';
    ELSE
        RAISE NOTICE 'Tags column already exists in categories table';
    END IF;
END $$;

-- Update the categories_view to include the featured column
DROP VIEW IF EXISTS public.categories_view;
CREATE VIEW public.categories_view AS 
SELECT 
    c.id, 
    c.name, 
    c.slug, 
    c.description, 
    c.image, 
    c.status, 
    c.featured, 
    c.tags, 
    c.created_at, 
    c.updated_at,
    0 as product_count,
    0 as revenue,
    0 as views
FROM public.categories c
ORDER BY c.name;

-- Grant permissions on the view
GRANT SELECT ON public.categories_view TO anon, authenticated;

-- Create or replace the get_featured_categories function
CREATE OR REPLACE FUNCTION get_featured_categories() 
RETURNS TABLE (id UUID, name VARCHAR, slug VARCHAR, description TEXT, image TEXT, status VARCHAR, featured BOOLEAN, tags TEXT[], created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT c.id, c.name, c.slug, c.description, c.image, c.status, c.featured, c.tags, c.created_at, c.updated_at
    FROM public.categories c 
    WHERE c.featured = true AND c.status = 'active'
    ORDER BY c.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the get_categories_by_status function to include featured
CREATE OR REPLACE FUNCTION get_categories_by_status(category_status VARCHAR) 
RETURNS TABLE (id UUID, name VARCHAR, slug VARCHAR, description TEXT, image TEXT, status VARCHAR, featured BOOLEAN, tags TEXT[], created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT c.id, c.name, c.slug, c.description, c.image, c.status, c.featured, c.tags, c.created_at, c.updated_at
    FROM public.categories c 
    WHERE c.status = category_status 
    ORDER BY c.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the search_categories function to include featured
CREATE OR REPLACE FUNCTION search_categories(search_term VARCHAR) 
RETURNS TABLE (id UUID, name VARCHAR, slug VARCHAR, description TEXT, image TEXT, status VARCHAR, featured BOOLEAN, tags TEXT[], created_at TIMESTAMP WITH TIME ZONE, updated_at TIMESTAMP WITH TIME ZONE, relevance_score INTEGER) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.description, 
        c.image, 
        c.status, 
        c.featured, 
        c.tags, 
        c.created_at, 
        c.updated_at,
        CASE 
            WHEN c.name ILIKE '%' || search_term || '%' THEN 3
            WHEN c.description ILIKE '%' || search_term || '%' THEN 2
            WHEN c.tags::text ILIKE '%' || search_term || '%' THEN 1
            ELSE 0
        END as relevance_score
    FROM public.categories c 
    WHERE (
        c.name ILIKE '%' || search_term || '%' OR
        c.description ILIKE '%' || search_term || '%' OR
        c.tags::text ILIKE '%' || search_term || '%'
    )
    ORDER BY relevance_score DESC, c.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_featured_categories() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_categories_by_status(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_categories(VARCHAR) TO anon, authenticated;
