-- Create user_addresses table
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON public.user_addresses(user_id, is_default);

-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own addresses" ON public.user_addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON public.user_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.user_addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON public.user_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON public.user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    -- If the new address is being set as default
    IF NEW.is_default = TRUE THEN
        -- Unset all other default addresses for this user
        UPDATE public.user_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_default = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to ensure only one default address per user
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON public.user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_address();
