-- =====================================================
-- ADD STORE CREDIT TO PAYMENT METHODS
-- =====================================================
-- This migration adds 'store_credit' to the allowed payment methods
-- in the orders table CHECK constraint
-- =====================================================

-- Step 1: Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Step 2: Add new constraint with store_credit included
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('card', 'paypal', 'bank_transfer', 'razorpay', 'cod', 'store_credit'));

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Successfully added store_credit to payment methods!';
    RAISE NOTICE '   - Allowed payment methods: card, paypal, bank_transfer, razorpay, cod, store_credit';
END $$;

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c';

