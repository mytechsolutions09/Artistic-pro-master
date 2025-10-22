-- =====================================================
-- SUPABASE SQL SETUP FOR PRODUCTS TABLE (CONSOLIDATED WITH MAIN IMAGE & PDF)
-- =====================================================

-- First, check what exists and drop only if it exists
DO $$ 
BEGIN
    -- Drop triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_category_count_trigger') THEN
        DROP TRIGGER IF EXISTS update_category_count_trigger ON products;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_rating_trigger') THEN
        DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
    END IF;
    
    -- Drop functions if they exist
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_category_count') THEN
        DROP FUNCTION IF EXISTS update_category_count() CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_product_rating') THEN
        DROP FUNCTION IF EXISTS update_product_rating() CASCADE;
    END IF;
    
    -- Drop view if it exists
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'product_stats') THEN
        DROP VIEW IF EXISTS product_stats;
    END IF;
    
    -- Drop tables if they exist (in reverse dependency order)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'order_items') THEN
        DROP TABLE IF EXISTS order_items CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'orders') THEN
        DROP TABLE IF EXISTS orders CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews') THEN
        DROP TABLE IF EXISTS reviews CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products') THEN
        DROP TABLE IF EXISTS products CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'categories') THEN
        DROP TABLE IF EXISTS categories CASCADE;
    END IF;
    
END $$;

-- Create products table with main image and PDF fields
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL, -- Changed to INTEGER for whole numbers
    original_price INTEGER, -- Added for discount functionality
    discount_percentage INTEGER DEFAULT 0, -- Added for discount functionality
    category VARCHAR(100) NOT NULL,
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    main_image VARCHAR(255), -- Main product image URL (for email and profile)
    pdf_url VARCHAR(255), -- PDF file URL (sent via email and available in profile)
    featured BOOLEAN DEFAULT false,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    tags TEXT[] DEFAULT '{}', -- Array of tags
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    reviews JSONB DEFAULT '[]', -- Store reviews as JSON array
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Product details sections
    item_details JSONB DEFAULT '{}', -- Store item details as JSON
    delivery_info JSONB DEFAULT '{}', -- Store delivery info as JSON
    did_you_know JSONB DEFAULT '{}' -- Store additional info as JSON
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add count column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'count'
    ) THEN
        ALTER TABLE categories ADD COLUMN count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added count column to categories table';
    END IF;
END $$;

-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    helpful INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected'))
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount INTEGER NOT NULL, -- Changed to INTEGER to match products price
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('card', 'paypal', 'bank_transfer', 'razorpay', 'cod', 'store_credit')),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    shipping_address TEXT,
    download_links TEXT[]
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_title VARCHAR(255) NOT NULL,
    product_image VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL, -- Changed to INTEGER to match products price
    total_price INTEGER NOT NULL -- Changed to INTEGER to match products price
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_created_date ON products(created_date);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_original_price ON products(original_price); -- Added index for discount queries
CREATE INDEX idx_products_discount_percentage ON products(discount_percentage); -- Added index for discount queries
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_images ON products USING GIN(images);
CREATE INDEX idx_products_main_image ON products(main_image); -- Added index for main image queries
CREATE INDEX idx_products_pdf_url ON products(pdf_url); -- Added index for PDF queries

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT TO public
    USING (status = 'active');

CREATE POLICY "Allow authenticated users to read all products" ON products
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to create products" ON products
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update products" ON products
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete products" ON products
    FOR DELETE TO authenticated
    USING (true);

-- Create RLS policies for categories
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Allow authenticated users to manage categories" ON categories
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create RLS policies for reviews
CREATE POLICY "Allow public read access to active reviews" ON reviews
    FOR SELECT TO public
    USING (status = 'active');

CREATE POLICY "Allow authenticated users to create reviews" ON reviews
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update their own reviews" ON reviews
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create RLS policies for orders
CREATE POLICY "Allow users to read their own orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

CREATE POLICY "Allow public read access to orders by email" ON orders
    FOR SELECT TO anon
    USING (true); -- Allow reading orders for guest users (can be restricted later)

CREATE POLICY "Allow authenticated users to create orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow guest users to create orders" ON orders
    FOR INSERT TO anon
    WITH CHECK (customer_id IS NULL); -- Allow guest orders with null customer_id

CREATE POLICY "Allow users to update their own orders" ON orders
    FOR UPDATE TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow admin to update orders" ON orders
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create RLS policies for order items
CREATE POLICY "Allow users to read their own order items" ON order_items
    FOR SELECT TO authenticated
    USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));

CREATE POLICY "Allow public read access to order items" ON order_items
    FOR SELECT TO anon
    USING (true); -- Allow reading order items for guest users

CREATE POLICY "Allow authenticated users to create order items" ON order_items
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow guest users to create order items" ON order_items
    FOR INSERT TO anon
    WITH CHECK (true); -- Allow creating order items for guest orders

-- Create function to update category count
CREATE OR REPLACE FUNCTION update_category_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if count column exists before trying to update it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'count'
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

-- Create triggers for category count
CREATE TRIGGER update_category_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_count();

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews 
            WHERE product_id = NEW.product_id AND status = 'active'
        )
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE products 
        SET rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews 
            WHERE product_id = NEW.product_id AND status = 'active'
        )
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products 
        SET rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews 
            WHERE product_id = OLD.product_id AND status = 'active'
        )
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for product rating
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- Insert production categories (24 categories as requested)
INSERT INTO categories (name, slug, description) VALUES
('Abstract', 'abstract', 'Abstract and contemporary art pieces'),
('Animals', 'animals', 'Wildlife and animal artwork'),
('Cars', 'cars', 'Automotive and vehicle art'),
('Floral', 'floral', 'Flower and botanical artwork'),
('Forest', 'forest', 'Nature and forest landscapes'),
('Digital Art', 'digital-art', 'Digital artwork and illustrations'),
('Portraits', 'portraits', 'Human and character portraits'),
('Landscapes', 'landscapes', 'Natural and urban landscapes'),
('Fantasy', 'fantasy', 'Fantasy and imaginative artwork'),
('Minimalist', 'minimalist', 'Simple and clean designs'),
('Nature', 'nature', 'Natural world and environmental art'),
('Modern', 'modern', 'Contemporary and modern art styles'),
('Vintage', 'vintage', 'Retro and vintage artwork'),
('Still Life', 'still-life', 'Inanimate object compositions'),
('Expressionist', 'expressionist', 'Emotional and expressive art'),
('Impressionist', 'impressionist', 'Light and color-focused artwork'),
('Surrealist', 'surrealist', 'Dreamlike and surreal compositions'),
('Contemporary', 'contemporary', 'Current and modern artistic styles'),
('Classical', 'classical', 'Traditional and classical art forms'),
('Pop Art', 'pop-art', 'Popular culture and modern art'),
('Street Art', 'street-art', 'Urban and street-inspired artwork'),
('Photography', 'photography', 'Photographic art and compositions'),
('Illustration', 'illustration', 'Detailed illustrations and drawings'),
('Mixed Media', 'mixed-media', 'Combined artistic techniques and materials')
ON CONFLICT (name) DO NOTHING;

-- No sample products - database will start empty for production use

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO public;

-- Create a view for product statistics
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE status = 'active') as active_products,
    COUNT(*) FILTER (WHERE featured = true) as featured_products,
    AVG(price) as average_price,
    SUM(downloads) as total_downloads,
    AVG(rating) as average_rating,
    SUM(price * downloads) as total_revenue,
    COUNT(*) FILTER (WHERE discount_percentage > 0) as discounted_products -- Added discount count
FROM products;

-- Grant access to the view
GRANT SELECT ON product_stats TO public;

-- Success message
SELECT 'Database setup completed successfully with main image and PDF fields!' as status;