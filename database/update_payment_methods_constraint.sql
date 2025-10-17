-- Update Orders Table Payment Method Constraint
-- This adds 'razorpay' and 'cod' to the allowed payment methods

-- Step 1: Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Step 2: Add new constraint with updated payment methods
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('card', 'paypal', 'bank_transfer', 'razorpay', 'cod'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c';

