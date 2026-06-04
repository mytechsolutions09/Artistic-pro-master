-- Categories Setup for Artistic Pro - FIXED VERSION
-- This file sets up the categories table and inserts default categories
-- Addresses all potential column reference and policy issues

-- Drop existing table if it exists (to ensure clean slate)
DROP TABLE IF EXISTS public.categories CASCADE;

-- Create categories table with explicit schema reference
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints explicitly
ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);

-- Create indexes for better performance
CREATE INDEX idx_categories_name ON public.categories(name);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_status ON public.categories(status);
CREATE INDEX idx_categories_featured ON public.categories(featured);
CREATE INDEX idx_categories_created_at ON public.categories(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON public.categories;

-- Create working policies (fixed auth.role() issue)
CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to manage categories" ON public.categories
    FOR ALL TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create function and trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at() RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.updated_at = NOW(); 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_categories_updated_at();

-- Insert default categories (comprehensive categories for all digital art types)
INSERT INTO public.categories (name, slug, description, image, status, featured, tags) VALUES
(
    'Digital Art',
    'digital-art',
    'Modern digital artwork and illustrations created with cutting-edge software and techniques',
    'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['digital', 'modern', 'illustration', 'software', 'contemporary']
),
(
    'Abstract',
    'abstract',
    'Contemporary abstract and modern art that challenges traditional boundaries',
    'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['abstract', 'modern', 'contemporary', 'bold', 'expressive']
),
(
    'Nature',
    'nature',
    'Breathtaking nature and landscape photography capturing Earth''s natural beauty',
    'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['nature', 'landscape', 'photography', 'natural', 'beauty']
),
(
    'Portraits',
    'portraits',
    'Expressive human and character portraits that capture personality and emotion',
    'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['portrait', 'human', 'character', 'emotion', 'personality']
),
(
    'Minimalist',
    'minimalist',
    'Clean and simple minimalist artwork emphasizing form, color, and space',
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['minimalist', 'clean', 'simple', 'elegant', 'modern']
),
(
    'Vintage/Retro',
    'vintage-retro',
    'Classic vintage and retro artwork capturing the charm of bygone eras',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['vintage', 'retro', 'classic', 'nostalgic', 'timeless']
),
(
    'Animals',
    'animals',
    'Stunning wildlife and animal artwork celebrating the beauty of the animal kingdom',
    'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['wildlife', 'animals', 'nature', 'majestic', 'graceful']
),
(
    'Cars',
    'cars',
    'Classic and modern automotive artwork featuring vintage and sports cars',
    'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['automotive', 'cars', 'vintage', 'classic', 'sports']
),
(
    'Super-Heroes',
    'super-heroes',
    'Epic superhero illustrations and comic book style artworks',
    'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['superhero', 'comic', 'action', 'dynamic', 'epic']
),
(
    'Floral',
    'floral',
    'Beautiful botanical and floral artwork featuring flowers and gardens',
    'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['floral', 'botanical', 'flowers', 'garden', 'delicate']
),
(
    'Forest',
    'forest',
    'Serene forest landscapes and woodland scenes capturing nature''s tranquility',
    'https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['forest', 'woodland', 'nature', 'serene', 'peaceful']
),
(
    'Futuristic',
    'futuristic',
    'Sci-fi and futuristic artwork imagining tomorrow''s world',
    'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['futuristic', 'sci-fi', 'future', 'technology', 'innovation']
),
(
    'City Maps',
    'city-maps',
    'Stylized city maps and urban navigation designs',
    'https://images.pexels.com/photos/2882570/pexels-photo-2882570.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['maps', 'city', 'urban', 'navigation', 'artistic']
),
(
    'Multi-Planetary',
    'multi-planetary',
    'Cosmic artwork featuring multiple planets and space scenes',
    'https://images.pexels.com/photos/2159065/pexels-photo-2159065.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['space', 'planets', 'cosmic', 'solar system', 'interstellar']
),
(
    'Music',
    'music',
    'Musical artwork featuring instruments and sound visualizations',
    'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['music', 'instruments', 'sound', 'harmony', 'rhythm']
),
(
    'Paintings',
    'paintings',
    'Digital paintings and traditional art styles recreated digitally',
    'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['painting', 'traditional', 'digital', 'classical', 'contemporary']
),
(
    'Scenic',
    'scenic',
    'Breathtaking scenic landscapes and natural vistas',
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['scenic', 'landscape', 'vista', 'natural', 'spectacular']
),
(
    'Technology',
    'technology',
    'Modern technology illustrations featuring gadgets and innovation',
    'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['technology', 'digital', 'innovation', 'modern', 'cutting-edge']
),
(
    'World Cities',
    'world-cities',
    'Urban skylines and cityscapes from major metropolitan areas',
    'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['city', 'skyline', 'urban', 'architecture', 'iconic']
),
(
    'Watercolor',
    'watercolor',
    'Fluid watercolor artworks with organic shapes and flowing colors',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    true,
    ARRAY['watercolor', 'fluid', 'organic', 'soft', 'vibrant']
),
(
    'Oil Painting Style',
    'oil-painting-style',
    'Digital artworks capturing traditional oil painting techniques',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['oil painting', 'traditional', 'classical', 'textured', 'rich']
),
(
    'Sketch & Line Art',
    'sketch-line-art',
    'Expressive line drawings and sketches celebrating simplicity and precision',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['sketch', 'line art', 'drawing', 'expressive', 'geometric']
),
(
    'Pop Art',
    'pop-art',
    'Vibrant pop art pieces with bold colors and iconic imagery',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['pop art', 'colorful', 'bold', 'popular culture', 'iconic']
),
(
    'Surreal',
    'surreal',
    'Dreamlike surreal artworks blending reality with imagination',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['surreal', 'dreamlike', 'fantasy', 'imaginative', 'symbolic']
),
(
    'Geometric',
    'geometric',
    'Precise geometric designs exploring mathematical beauty and symmetry',
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['geometric', 'pattern', 'mathematical', 'precise', 'symmetrical']
),
(
    'Grunge',
    'grunge',
    'Gritty grunge artworks with textured surfaces and urban aesthetics',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['grunge', 'textured', 'urban', 'industrial', 'raw']
),
(
    'Photorealistic',
    'photorealistic',
    'Incredibly detailed photorealistic artworks challenging the boundary between photography and painting',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400',
    'active',
    false,
    ARRAY['photorealistic', 'detailed', 'lifelike', 'realistic', 'skillful']
);

-- Create a simple view for easy category access
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

-- Grant permissions
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT SELECT ON public.categories_view TO anon, authenticated;

-- Create functions to get categories by various criteria
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
    WHERE 
        c.name ILIKE '%' || search_term || '%' OR 
        c.description ILIKE '%' || search_term || '%' OR 
        c.tags::text ILIKE '%' || search_term || '%' 
    ORDER BY relevance_score DESC, c.name; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get category statistics
CREATE OR REPLACE FUNCTION get_category_stats() 
RETURNS TABLE (total_categories BIGINT, active_categories BIGINT, featured_categories BIGINT, total_products BIGINT, avg_products_per_category NUMERIC) AS $$ 
BEGIN 
    RETURN QUERY 
    SELECT 
        COUNT(*) as total_categories,
        COUNT(*) FILTER (WHERE c.status = 'active') as active_categories,
        COUNT(*) FILTER (WHERE c.featured = true) as featured_categories,
        0 as total_products,
        0 as avg_products_per_category
    FROM public.categories c; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Categories setup completed successfully!'; 
    RAISE NOTICE 'Created % category(ies)', (SELECT COUNT(*) FROM public.categories); 
    RAISE NOTICE 'Featured categories: %', (SELECT string_agg(name, ', ') FROM public.categories WHERE featured = true); 
    RAISE NOTICE 'Active categories: %', (SELECT string_agg(name, ', ') FROM public.categories WHERE status = 'active');
END $$;
