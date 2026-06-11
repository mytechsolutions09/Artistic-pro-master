-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletters table (for saving newsletter campaigns)
CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON public.newsletters(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up updated_at triggers
DROP TRIGGER IF EXISTS trigger_update_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER trigger_update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_newsletters_updated_at ON public.newsletters;
CREATE TRIGGER trigger_update_newsletters_updated_at
    BEFORE UPDATE ON public.newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscribers
-- 1. Allow anyone (including anonymous users) to insert new subscriptions
DROP POLICY IF EXISTS "Allow public to subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Allow public to subscribe" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- 2. Allow authenticated users to view subscribers (admin access)
DROP POLICY IF EXISTS "Allow authenticated users to read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow authenticated users to read subscribers" ON public.newsletter_subscribers
    FOR SELECT TO authenticated USING (true);

-- 3. Allow authenticated users to update subscribers (admin edit status/email)
DROP POLICY IF EXISTS "Allow authenticated users to update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow authenticated users to update subscribers" ON public.newsletter_subscribers
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4. Allow authenticated users to delete subscribers (admin remove)
DROP POLICY IF EXISTS "Allow authenticated users to delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow authenticated users to delete subscribers" ON public.newsletter_subscribers
    FOR DELETE TO authenticated USING (true);

-- RLS Policies for newsletters (Campaigns)
-- Restrict all operations to authenticated users (admins)
DROP POLICY IF EXISTS "Allow authenticated users to manage newsletters" ON public.newsletters;
CREATE POLICY "Allow authenticated users to manage newsletters" ON public.newsletters
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO service_role;

GRANT ALL ON public.newsletters TO authenticated;
GRANT ALL ON public.newsletters TO service_role;
