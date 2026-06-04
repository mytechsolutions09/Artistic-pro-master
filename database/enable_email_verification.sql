-- Enable Email Verification in Supabase
-- Run this SQL in your Supabase SQL Editor to ensure email verification is properly configured

-- Note: Email confirmation settings are configured in the Supabase Dashboard
-- Go to Authentication > Settings and enable "Email confirmations"
-- This SQL script focuses on database-level configurations and policies

-- 2. Set up proper email templates (if needed)
-- You can customize these in the Supabase Dashboard > Authentication > Email Templates

-- 3. Ensure RLS policies respect email confirmation status
-- This policy ensures only confirmed users can access protected resources
CREATE POLICY "Only confirmed users can access user data" ON auth.users
  FOR ALL USING (email_confirmed_at IS NOT NULL);

-- 4. Create a function to check if user is confirmed
CREATE OR REPLACE FUNCTION is_user_confirmed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update existing RLS policies to check for email confirmation
-- This ensures that unconfirmed users cannot access protected data

-- Example: Update orders table to only allow confirmed users
DROP POLICY IF EXISTS "Allow users to read their own orders" ON orders;
CREATE POLICY "Allow confirmed users to read their own orders" ON orders
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() 
    AND is_user_confirmed(auth.uid())
  );

-- Example: Update order_items table
DROP POLICY IF EXISTS "Allow users to read their own order items" ON order_items;
CREATE POLICY "Allow confirmed users to read their own order items" ON order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
      AND is_user_confirmed(auth.uid())
    )
  );

-- 6. Create a view for confirmed users only
CREATE OR REPLACE VIEW confirmed_users AS
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

-- 7. Grant appropriate permissions
GRANT SELECT ON confirmed_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_confirmed(UUID) TO authenticated;

-- 8. Add a trigger to automatically clean up unconfirmed users after 24 hours
CREATE OR REPLACE FUNCTION cleanup_unconfirmed_users()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users 
  WHERE email_confirmed_at IS NULL 
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-unconfirmed-users', '0 2 * * *', 'SELECT cleanup_unconfirmed_users();');

-- 10. Add helpful comments
COMMENT ON FUNCTION is_user_confirmed(UUID) IS 'Check if a user has confirmed their email address';
COMMENT ON FUNCTION cleanup_unconfirmed_users() IS 'Remove unconfirmed users older than 24 hours';
COMMENT ON VIEW confirmed_users IS 'View of users who have confirmed their email addresses';

-- 11. Verify the configuration
SELECT 
  'Email verification database policies are now configured' as status,
  'Please enable email confirmations in Supabase Dashboard > Authentication > Settings' as next_step;
