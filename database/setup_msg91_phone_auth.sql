-- =============================================================================
-- MSG91 Phone Authentication Setup
-- =============================================================================
-- This script sets up database tables and functions for phone authentication
-- using MSG91 SMS service instead of Twilio
-- =============================================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS phone_otp CASCADE;
DROP TABLE IF EXISTS phone_auth_logs CASCADE;

-- =============================================================================
-- PHONE OTP TABLE
-- =============================================================================
-- Stores OTP codes for phone number verification
CREATE TABLE phone_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_phone_otp_phone ON phone_otp(phone);
CREATE INDEX idx_phone_otp_created_at ON phone_otp(created_at);
CREATE INDEX idx_phone_otp_verified ON phone_otp(verified);

-- Add RLS policies
ALTER TABLE phone_otp ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage OTP records
CREATE POLICY "Service role can manage OTP records"
  ON phone_otp
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- PHONE AUTH LOGS TABLE
-- =============================================================================
-- Logs all phone authentication attempts for monitoring and rate limiting
CREATE TABLE phone_auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  action TEXT NOT NULL, -- 'send_otp', 'verify_otp', 'resend_otp'
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_phone_auth_logs_phone ON phone_auth_logs(phone);
CREATE INDEX idx_phone_auth_logs_created_at ON phone_auth_logs(created_at);
CREATE INDEX idx_phone_auth_logs_action ON phone_auth_logs(action);

-- Add RLS policies
ALTER TABLE phone_auth_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage logs
CREATE POLICY "Service role can manage auth logs"
  ON phone_auth_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own logs
CREATE POLICY "Users can view their own auth logs"
  ON phone_auth_logs
  FOR SELECT
  TO authenticated
  USING (phone = (SELECT phone FROM auth.users WHERE id = auth.uid()));

-- =============================================================================
-- CLEANUP FUNCTION
-- =============================================================================
-- Automatically delete expired OTPs (runs periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM phone_otp
  WHERE expires_at < NOW()
  OR (verified = true AND created_at < NOW() - INTERVAL '1 hour');
END;
$$;

-- =============================================================================
-- RATE LIMITING FUNCTION
-- =============================================================================
-- Check if a phone number has exceeded rate limits
CREATE OR REPLACE FUNCTION check_phone_rate_limit(
  p_phone TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM phone_auth_logs
  WHERE phone = p_phone
  AND action IN ('send_otp', 'resend_otp')
  AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Return true if under the limit, false if exceeded
  RETURN v_attempt_count < p_max_attempts;
END;
$$;

-- =============================================================================
-- GET PHONE AUTH STATS FUNCTION
-- =============================================================================
-- Get authentication statistics for a phone number
CREATE OR REPLACE FUNCTION get_phone_auth_stats(p_phone TEXT)
RETURNS TABLE (
  total_attempts BIGINT,
  successful_attempts BIGINT,
  failed_attempts BIGINT,
  last_attempt TIMESTAMPTZ,
  last_success TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE success = true) as successful_attempts,
    COUNT(*) FILTER (WHERE success = false) as failed_attempts,
    MAX(created_at) as last_attempt,
    MAX(created_at) FILTER (WHERE success = true) as last_success
  FROM phone_auth_logs
  WHERE phone = p_phone;
END;
$$;

-- =============================================================================
-- LOG PHONE AUTH ATTEMPT FUNCTION
-- =============================================================================
-- Log a phone authentication attempt
CREATE OR REPLACE FUNCTION log_phone_auth_attempt(
  p_phone TEXT,
  p_action TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO phone_auth_logs (
    phone,
    action,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_phone,
    p_action,
    p_success,
    p_error_message,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update updated_at timestamp on phone_otp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_phone_otp_updated_at
  BEFORE UPDATE ON phone_otp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CLEANUP OLD RECORDS (Optional periodic task)
-- =============================================================================
-- You can set up a cron job or pg_cron extension to run this periodically:
-- SELECT cleanup_expired_otps();

-- For now, create a simple view to see which records would be cleaned up
CREATE OR REPLACE VIEW expired_otps AS
SELECT *
FROM phone_otp
WHERE expires_at < NOW()
OR (verified = true AND created_at < NOW() - INTERVAL '1 hour');

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT ON phone_auth_logs TO authenticated;
GRANT SELECT ON expired_otps TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON phone_otp TO service_role;
GRANT ALL ON phone_auth_logs TO service_role;
GRANT ALL ON expired_otps TO service_role;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if tables were created successfully
SELECT 
  'phone_otp' as table_name,
  COUNT(*) as record_count
FROM phone_otp
UNION ALL
SELECT 
  'phone_auth_logs' as table_name,
  COUNT(*) as record_count
FROM phone_auth_logs;

-- Test rate limiting function
-- SELECT check_phone_rate_limit('+919876543210', 5, 60);

-- View phone auth stats
-- SELECT * FROM get_phone_auth_stats('+919876543210');

COMMENT ON TABLE phone_otp IS 'Stores OTP codes for phone number verification using MSG91';
COMMENT ON TABLE phone_auth_logs IS 'Logs all phone authentication attempts for monitoring';
COMMENT ON FUNCTION cleanup_expired_otps() IS 'Deletes expired and verified OTP records';
COMMENT ON FUNCTION check_phone_rate_limit(TEXT, INTEGER, INTEGER) IS 'Checks if a phone number has exceeded rate limits';
COMMENT ON FUNCTION get_phone_auth_stats(TEXT) IS 'Returns authentication statistics for a phone number';
COMMENT ON FUNCTION log_phone_auth_attempt(TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT) IS 'Logs a phone authentication attempt';

