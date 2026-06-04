-- Add currency information to orders table
-- This migration adds currency tracking to orders to ensure proper display

-- Add currency columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'INR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency_rate DECIMAL(10,6) DEFAULT 1.0;

-- Add currency columns to order_items table  
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'INR';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS currency_rate DECIMAL(10,6) DEFAULT 1.0;

-- Update existing orders to have INR as default currency
UPDATE orders SET currency_code = 'INR', currency_rate = 1.0 WHERE currency_code IS NULL;
UPDATE order_items SET currency_code = 'INR', currency_rate = 1.0 WHERE currency_code IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_currency ON orders(currency_code);
CREATE INDEX IF NOT EXISTS idx_order_items_currency ON order_items(currency_code);

-- Add comments for documentation
COMMENT ON COLUMN orders.currency_code IS 'Currency code when order was placed (e.g., USD, EUR, INR)';
COMMENT ON COLUMN orders.currency_rate IS 'Exchange rate from base currency (INR) to order currency at time of order';
COMMENT ON COLUMN order_items.currency_code IS 'Currency code for this order item';
COMMENT ON COLUMN order_items.currency_rate IS 'Exchange rate for this order item';

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Currency columns added to orders and order_items tables successfully!';
    RAISE NOTICE 'All existing orders set to INR currency with rate 1.0';
END $$;
