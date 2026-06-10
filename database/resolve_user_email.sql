-- =====================================================
-- FUNCTION: resolve_user_email
-- =====================================================
-- Resolves an email, phone number, or username input into the correct registration email address.
-- This allows logging in using email, username, or mobile number.
-- Run this in the Supabase SQL Editor if you are recreating the database.

CREATE OR REPLACE FUNCTION public.resolve_user_email(identifier TEXT)
RETURNS TEXT AS $$
DECLARE
  resolved_email TEXT;
  clean_phone TEXT;
BEGIN
  -- 1. Check if the identifier is already an email in auth.users
  SELECT email INTO resolved_email
  FROM auth.users
  WHERE LOWER(email) = LOWER(identifier)
  LIMIT 1;

  IF resolved_email IS NOT NULL THEN
    RETURN resolved_email;
  END IF;

  -- 2. Clean phone number (keep only digits)
  clean_phone := regexp_replace(identifier, '\D', '', 'g');

  IF clean_phone <> '' THEN
    -- Check in auth.users.phone
    SELECT email INTO resolved_email
    FROM auth.users
    WHERE phone = clean_phone 
       OR phone = '+' || clean_phone 
       OR phone = '+91' || clean_phone
       OR phone LIKE '%' || clean_phone
    LIMIT 1;

    IF resolved_email IS NOT NULL THEN
      RETURN resolved_email;
    END IF;

    -- Check in user_metadata phone
    SELECT email INTO resolved_email
    FROM auth.users
    WHERE raw_user_meta_data->>'phone' = clean_phone
       OR raw_user_meta_data->>'phone' = '+' || clean_phone
       OR raw_user_meta_data->>'phone' = '+91' || clean_phone
       OR raw_user_meta_data->>'phone' LIKE '%' || clean_phone
    LIMIT 1;

    IF resolved_email IS NOT NULL THEN
      RETURN resolved_email;
    END IF;
  END IF;

  -- 3. Check in user_metadata name fields (like full_name, first_name, username)
  SELECT email INTO resolved_email
  FROM auth.users
  WHERE LOWER(raw_user_meta_data->>'full_name') = LOWER(identifier)
     OR LOWER(raw_user_meta_data->>'first_name') = LOWER(identifier)
     OR LOWER(raw_user_meta_data->>'username') = LOWER(identifier)
     OR LOWER(raw_user_meta_data->>'name') = LOWER(identifier)
  LIMIT 1;

  RETURN resolved_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.resolve_user_email(TEXT) TO anon, authenticated, service_role;
