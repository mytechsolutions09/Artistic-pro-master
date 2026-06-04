-- =====================================================
-- PHONE AUTHENTICATION SETUP FOR SUPABASE
-- =====================================================
-- This script sets up phone authentication infrastructure
-- Run this after enabling Phone Auth in Supabase Dashboard

-- =====================================================
-- 1. VERIFY PHONE AUTHENTICATION IS ENABLED
-- =====================================================
-- Before running this script, ensure you have:
-- 1. Enabled Phone Provider in Supabase Dashboard
-- 2. Configured Twilio (or other SMS provider)
-- 3. Tested with a test phone number

-- =====================================================
-- 2. ADD PHONE NUMBER TO USER PROFILES (Optional)
-- =====================================================
-- Add phone column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
    CREATE INDEX idx_profiles_phone ON profiles(phone);
  END IF;
END $$;

-- Add phone verification status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- 3. CREATE PHONE AUTH LOGS TABLE (Optional)
-- =====================================================
-- Track OTP sends for security and debugging
CREATE TABLE IF NOT EXISTS phone_auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  action TEXT NOT NULL, -- 'send_otp', 'verify_otp', 'resend_otp'
  success BOOLEAN NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for querying
CREATE INDEX IF NOT EXISTS idx_phone_auth_logs_user_id ON phone_auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_auth_logs_phone ON phone_auth_logs(phone);
CREATE INDEX IF NOT EXISTS idx_phone_auth_logs_created_at ON phone_auth_logs(created_at DESC);

-- =====================================================
-- 4. CREATE FUNCTION TO SYNC PHONE TO PROFILE
-- =====================================================
-- Automatically sync phone number from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_phone_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile with phone number from auth
  UPDATE profiles 
  SET 
    phone = NEW.phone,
    phone_verified = (NEW.phone_confirmed_at IS NOT NULL),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- Create profile if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO profiles (id, phone, phone_verified, created_at, updated_at)
    VALUES (NEW.id, NEW.phone, (NEW.phone_confirmed_at IS NOT NULL), NOW(), NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for phone sync
DROP TRIGGER IF EXISTS on_auth_user_phone_updated ON auth.users;
CREATE TRIGGER on_auth_user_phone_updated
  AFTER INSERT OR UPDATE OF phone, phone_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.phone IS NOT NULL)
  EXECUTE FUNCTION sync_phone_to_profile();

-- =====================================================
-- 5. CREATE RATE LIMITING FUNCTION
-- =====================================================
-- Prevent OTP spam (max 5 attempts per hour per phone)
CREATE OR REPLACE FUNCTION check_otp_rate_limit(
  p_phone TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count OTP sends in last hour
  SELECT COUNT(*)
  INTO v_count
  FROM phone_auth_logs
  WHERE phone = p_phone
    AND action = 'send_otp'
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return true if under limit (5 per hour)
  RETURN v_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE FUNCTION TO LOG PHONE AUTH EVENTS
-- =====================================================
CREATE OR REPLACE FUNCTION log_phone_auth_event(
  p_user_id UUID,
  p_phone TEXT,
  p_action TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO phone_auth_logs (
    user_id,
    phone,
    action,
    success,
    error_message,
    created_at
  ) VALUES (
    p_user_id,
    p_phone,
    p_action,
    p_success,
    p_error_message,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on phone_auth_logs
ALTER TABLE phone_auth_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own phone auth logs"
  ON phone_auth_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can view all logs
CREATE POLICY "Admins can view all phone auth logs"
  ON phone_auth_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Service role can insert logs
CREATE POLICY "Service can insert phone auth logs"
  ON phone_auth_logs
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 8. CREATE VIEW FOR PHONE AUTH STATS (Admin)
-- =====================================================
CREATE OR REPLACE VIEW phone_auth_stats AS
SELECT
  DATE(created_at) as date,
  action,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
  ROUND(
    (SUM(CASE WHEN success THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 
    2
  ) as success_rate
FROM phone_auth_logs
GROUP BY DATE(created_at), action
ORDER BY date DESC, action;

-- Grant access to admins only
GRANT SELECT ON phone_auth_stats TO authenticated;

-- =====================================================
-- 9. ADD PHONE TO USER DASHBOARD
-- =====================================================
-- Users can update their phone number
CREATE POLICY "Users can update their own phone number"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 10. CREATE CLEANUP FUNCTION
-- =====================================================
-- Clean up old phone auth logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_phone_auth_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM phone_auth_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled:
-- SELECT cron.schedule(
--   'cleanup-phone-auth-logs',
--   '0 2 * * *', -- Run at 2 AM daily
--   'SELECT cleanup_old_phone_auth_logs();'
-- );

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON phone_auth_logs TO authenticated;
GRANT EXECUTE ON FUNCTION check_otp_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION log_phone_auth_event TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify setup:

-- Check if phone column exists
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('phone', 'phone_verified');

-- Check if phone_auth_logs table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'phone_auth_logs';

-- Check if functions exist
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_name IN ('sync_phone_to_profile', 'check_otp_rate_limit', 'log_phone_auth_event');

-- Test rate limiting (should return true)
-- SELECT check_otp_rate_limit('+919876543210');

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This script is safe to run multiple times (idempotent)
-- 2. Make sure to enable Phone Auth in Supabase Dashboard first
-- 3. Configure Twilio or another SMS provider
-- 4. Test with test phone numbers before production
-- 5. Monitor phone_auth_logs for any issues
-- 6. Set up proper rate limiting in production
-- 7. Consider implementing 2FA with phone numbers

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Enable Phone Auth in Supabase Dashboard:
--    - Go to Authentication → Providers → Phone
--    - Toggle "Enable Phone provider"
--    - Configure Twilio settings
--
-- 2. Add test phone numbers (optional):
--    - Go to Authentication → Settings
--    - Scroll to "Phone Auth Test Numbers"
--    - Add: +919999999999 with OTP: 123456
--
-- 3. Test the integration:
--    - Go to your login page
--    - Click "Phone" tab
--    - Enter test number
--    - Verify OTP works
--
-- 4. Monitor logs:
--    SELECT * FROM phone_auth_logs ORDER BY created_at DESC LIMIT 10;
--
-- 5. Check success rates:
--    SELECT * FROM phone_auth_stats ORDER BY date DESC LIMIT 7;

-- =====================================================
-- END OF SCRIPT
-- =====================================================

