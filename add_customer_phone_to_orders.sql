-- Add customer_phone column to orders table if it doesn't exist
-- This will allow storing customer phone numbers for shipping purposes

-- Check if column exists and add it if not
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'customer_phone'
  ) THEN
    -- Add customer_phone column
    ALTER TABLE orders 
    ADD COLUMN customer_phone TEXT;
    
    RAISE NOTICE 'Successfully added customer_phone column to orders table';
  ELSE
    RAISE NOTICE 'customer_phone column already exists in orders table';
  END IF;
END $$;

-- Add index for faster phone number lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone 
ON orders(customer_phone);

-- Add comment for documentation
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone number for order contact and shipping purposes';

