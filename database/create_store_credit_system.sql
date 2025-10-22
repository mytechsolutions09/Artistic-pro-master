-- ================================================
-- STORE CREDIT SYSTEM
-- ================================================
-- This file creates tables and functions for managing store credits
-- Created: October 22, 2025

-- ================================================
-- 1. CREATE STORE CREDITS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS public.store_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ================================================
-- 2. CREATE STORE CREDIT TRANSACTIONS TABLE
-- ================================================
-- Track all credit additions and deductions

CREATE TABLE IF NOT EXISTS public.store_credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'return')),
    description TEXT,
    order_id TEXT,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- ================================================
-- 3. CREATE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_store_credits_user_id ON public.store_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_store_credit_transactions_user_id ON public.store_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_credit_transactions_order_id ON public.store_credit_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_store_credit_transactions_created_at ON public.store_credit_transactions(created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.store_credit_transactions.order_id IS 'Custom order ID (e.g., ORD_1234567890_abc123) - stored as TEXT, not the UUID from orders table';

-- ================================================
-- 4. CREATE FUNCTION TO GET USER CREDIT BALANCE
-- ================================================

CREATE OR REPLACE FUNCTION public.get_user_credit_balance(p_user_id UUID)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(balance, 0.00)
    INTO v_balance
    FROM public.store_credits
    WHERE user_id = p_user_id;
    
    -- If no record exists, return 0
    IF v_balance IS NULL THEN
        v_balance := 0.00;
    END IF;
    
    RETURN v_balance;
END;
$$;

-- ================================================
-- 5. CREATE FUNCTION TO ADD STORE CREDIT
-- ================================================

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

-- ================================================
-- 6. CREATE FUNCTION TO DEDUCT STORE CREDIT
-- ================================================

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

-- ================================================
-- 7. CREATE RLS POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE public.store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Store Credits Policies
-- Users can view their own store credits
CREATE POLICY "Users can view their own store credits"
    ON public.store_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow inserts for store credits (functions use SECURITY DEFINER)
CREATE POLICY "Allow inserts for store credits"
    ON public.store_credits
    FOR INSERT
    WITH CHECK (true);

-- Allow updates for store credits (functions use SECURITY DEFINER)
CREATE POLICY "Allow updates for store credits"
    ON public.store_credits
    FOR UPDATE
    USING (true);

-- Store Credit Transactions Policies
-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
    ON public.store_credit_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow inserts for transactions (functions use SECURITY DEFINER)
CREATE POLICY "Allow inserts for transactions"
    ON public.store_credit_transactions
    FOR INSERT
    WITH CHECK (true);

-- ================================================
-- 8. GRANT PERMISSIONS
-- ================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_credit_balance(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.add_store_credit(UUID, DECIMAL, TEXT, UUID, VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_store_credit(UUID, DECIMAL, TEXT, UUID) TO authenticated, service_role;

-- Grant table permissions
GRANT SELECT ON public.store_credits TO authenticated, anon, service_role;
GRANT INSERT, UPDATE ON public.store_credits TO service_role;

GRANT SELECT ON public.store_credit_transactions TO authenticated, anon, service_role;
GRANT INSERT ON public.store_credit_transactions TO service_role;

-- ================================================
-- SETUP COMPLETE
-- ================================================

COMMENT ON TABLE public.store_credits IS 'Stores user store credit balances';
COMMENT ON TABLE public.store_credit_transactions IS 'Tracks all store credit transactions';
COMMENT ON FUNCTION public.get_user_credit_balance IS 'Returns the current store credit balance for a user';
COMMENT ON FUNCTION public.add_store_credit IS 'Adds store credit to a user account';
COMMENT ON FUNCTION public.deduct_store_credit IS 'Deducts store credit from a user account';

