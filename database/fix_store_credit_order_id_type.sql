-- =====================================================
-- FIX: Store Credit Transactions order_id Type
-- =====================================================
-- This migration fixes the order_id column type mismatch
-- Changes order_id from UUID to TEXT to support custom order IDs
-- =====================================================

-- Drop the foreign key constraint first
ALTER TABLE IF EXISTS public.store_credit_transactions
DROP CONSTRAINT IF EXISTS store_credit_transactions_order_id_fkey;

-- Change the order_id column type from UUID to TEXT
ALTER TABLE IF EXISTS public.store_credit_transactions
ALTER COLUMN order_id TYPE TEXT USING order_id::TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.store_credit_transactions.order_id IS 'Custom order ID (e.g., ORD_1234567890_abc123) - stored as TEXT, not the UUID from orders table';

-- Drop old function versions that use UUID for order_id
DROP FUNCTION IF EXISTS public.add_store_credit(UUID, DECIMAL, TEXT, UUID, VARCHAR);
DROP FUNCTION IF EXISTS public.deduct_store_credit(UUID, DECIMAL, TEXT, UUID);

-- Update add_store_credit function to accept TEXT order_id
CREATE OR REPLACE FUNCTION public.add_store_credit(
    p_user_id UUID,
    p_amount DECIMAL(10, 2),
    p_description TEXT DEFAULT NULL,
    p_order_id TEXT DEFAULT NULL,
    p_transaction_type VARCHAR(50) DEFAULT 'credit'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance DECIMAL(10, 2);
    v_new_balance DECIMAL(10, 2);
    v_credit_id UUID;
    v_transaction_id UUID;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Amount must be greater than zero'
        );
    END IF;
    
    -- Get or create credit record
    SELECT id, balance INTO v_credit_id, v_current_balance
    FROM public.store_credits
    WHERE user_id = p_user_id;
    
    IF v_credit_id IS NULL THEN
        -- Create new credit record
        INSERT INTO public.store_credits (user_id, balance)
        VALUES (p_user_id, p_amount)
        RETURNING id, balance INTO v_credit_id, v_new_balance;
        
        v_current_balance := 0.00;
    ELSE
        -- Update existing record
        v_new_balance := v_current_balance + p_amount;
        
        UPDATE public.store_credits
        SET balance = v_new_balance,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_credit_id;
    END IF;
    
    -- Record transaction
    INSERT INTO public.store_credit_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        order_id,
        balance_before,
        balance_after,
        created_by
    )
    VALUES (
        p_user_id,
        p_amount,
        p_transaction_type,
        p_description,
        p_order_id,
        v_current_balance,
        v_new_balance,
        auth.uid()
    )
    RETURNING id INTO v_transaction_id;
    
    RETURN json_build_object(
        'success', true,
        'credit_id', v_credit_id,
        'transaction_id', v_transaction_id,
        'balance_before', v_current_balance,
        'balance_after', v_new_balance
    );
END;
$$;

-- Update deduct_store_credit function to accept TEXT order_id
CREATE OR REPLACE FUNCTION public.deduct_store_credit(
    p_user_id UUID,
    p_amount DECIMAL(10, 2),
    p_description TEXT DEFAULT NULL,
    p_order_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance DECIMAL(10, 2);
    v_new_balance DECIMAL(10, 2);
    v_credit_id UUID;
    v_transaction_id UUID;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Amount must be greater than zero'
        );
    END IF;
    
    -- Get credit record
    SELECT id, balance INTO v_credit_id, v_current_balance
    FROM public.store_credits
    WHERE user_id = p_user_id;
    
    IF v_credit_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No store credit available'
        );
    END IF;
    
    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient store credit balance',
            'available', v_current_balance,
            'requested', p_amount
        );
    END IF;
    
    -- Deduct amount
    v_new_balance := v_current_balance - p_amount;
    
    UPDATE public.store_credits
    SET balance = v_new_balance,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_credit_id;
    
    -- Record transaction
    INSERT INTO public.store_credit_transactions (
        user_id,
        amount,
        transaction_type,
        description,
        order_id,
        balance_before,
        balance_after,
        created_by
    )
    VALUES (
        p_user_id,
        -p_amount,
        'debit',
        p_description,
        p_order_id,
        v_current_balance,
        v_new_balance,
        auth.uid()
    )
    RETURNING id INTO v_transaction_id;
    
    RETURN json_build_object(
        'success', true,
        'credit_id', v_credit_id,
        'transaction_id', v_transaction_id,
        'balance_before', v_current_balance,
        'balance_after', v_new_balance
    );
END;
$$;

-- Display success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Successfully fixed store credit system for custom order IDs!';
    RAISE NOTICE '   - Changed order_id column from UUID to TEXT';
    RAISE NOTICE '   - Removed foreign key constraint';
    RAISE NOTICE '   - Updated add_store_credit() function signature';
    RAISE NOTICE '   - Updated deduct_store_credit() function signature';
    RAISE NOTICE '   - You can now use custom order IDs like "ORD_1234567890_abc123"';
END $$;

