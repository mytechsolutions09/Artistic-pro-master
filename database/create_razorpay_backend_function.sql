-- Supabase Edge Function Alternative: Database Function for Razorpay Order Creation
-- This creates a database function that can be called from the frontend
-- Note: For production, use Supabase Edge Functions or a proper backend

-- Create a function to generate Razorpay-compatible order IDs
CREATE OR REPLACE FUNCTION generate_razorpay_order_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'order_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || substr(md5(random()::text), 1, 9);
END;
$$ LANGUAGE plpgsql;

-- Create a function to create Razorpay orders
-- Note: This is a workaround. Ideally, call Razorpay API from backend
CREATE OR REPLACE FUNCTION create_razorpay_order(
  p_order_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_customer_id TEXT,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT
)
RETURNS JSON AS $$
DECLARE
  v_razorpay_order_id TEXT;
  v_amount_paise INTEGER;
  v_result JSON;
BEGIN
  -- Generate Razorpay order ID
  v_razorpay_order_id := generate_razorpay_order_id();
  
  -- Convert amount to paise (smallest currency unit)
  v_amount_paise := ROUND(p_amount * 100);
  
  -- Insert into razorpay_orders table
  INSERT INTO razorpay_orders (
    order_id,
    razorpay_order_id,
    amount,
    currency,
    customer_id,
    customer_email,
    customer_name,
    customer_phone,
    status,
    created_at
  ) VALUES (
    p_order_id,
    v_razorpay_order_id,
    v_amount_paise,
    p_currency,
    p_customer_id,
    p_customer_email,
    p_customer_name,
    p_customer_phone,
    'created',
    NOW()
  );
  
  -- Return result as JSON
  v_result := json_build_object(
    'success', true,
    'razorpay_order_id', v_razorpay_order_id,
    'amount', v_amount_paise,
    'currency', p_currency,
    'order_id', p_order_id
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_razorpay_order TO authenticated;
GRANT EXECUTE ON FUNCTION generate_razorpay_order_id TO authenticated;

-- Add customer fields to razorpay_orders table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'razorpay_orders' 
                 AND column_name = 'customer_name') THEN
    ALTER TABLE razorpay_orders ADD COLUMN customer_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'razorpay_orders' 
                 AND column_name = 'customer_phone') THEN
    ALTER TABLE razorpay_orders ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

-- Success message
SELECT 'Razorpay backend function created successfully!' as status;
