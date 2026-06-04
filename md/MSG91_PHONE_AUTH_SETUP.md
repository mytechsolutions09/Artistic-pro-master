# MSG91 Phone Authentication Setup Guide

## Overview

This guide helps you set up phone OTP authentication using **MSG91** SMS service for Indian users. MSG91 is much more cost-effective than Twilio for Indian SMS delivery.

## Why MSG91?

### Cost Comparison (India)
- **MSG91:** ₹0.10-0.30 per SMS
- **Twilio:** ₹0.50-1.50 per SMS
- **Savings:** Up to **90% cheaper** with MSG91

### Benefits
- ✅ Better delivery rates in India
- ✅ No monthly rental fees
- ✅ Excellent Indian network coverage (Jio, Airtel, Vodafone, BSNL)
- ✅ DND-compliant SMS delivery
- ✅ 24/7 Indian support
- ✅ No setup fees

---

## Quick Setup (15 Minutes)

### Step 1: Create MSG91 Account (5 minutes)

1. **Sign up at MSG91:**
   - Visit: https://msg91.com/
   - Click "Sign Up" (top right)
   - Enter your details:
     - Name
     - Email
     - Phone number (Indian)
     - Company name
   - Verify your email

2. **Complete KYC (Required for production):**
   - Go to MSG91 Dashboard
   - Navigate to **Settings** → **KYC**
   - Upload required documents:
     - Company registration
     - ID proof
     - Address proof
   - KYC approval takes 1-2 business days

3. **Get Free Credits:**
   - MSG91 provides **free test credits** for new accounts
   - Good for testing before going live

### Step 2: Get MSG91 Credentials (3 minutes)

1. **Get Auth Key:**
   - Log in to MSG91 Dashboard
   - Go to **Settings** → **API Keys**
   - Copy your **Auth Key**
   - Store it safely (you'll need it later)

2. **Get Sender ID:**
   - Go to **Sender ID** section
   - For testing: Use default sender ID: `MSGIND`
   - For production: Create custom sender ID (e.g., `YOURCO`)
   - Note: Custom sender ID requires KYC approval

3. **Create OTP Template (Required):**
   - Go to **SMS** → **Templates**
   - Click **"Create Template"**
   - Select template type: **OTP**
   - Enter template content:
     ```
     Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
     ```
   - Submit for approval
   - Copy the **Template ID** once approved
   - Note: Template approval takes 1-2 hours

### Step 3: Setup Supabase Database (2 minutes)

1. **Run SQL Script:**
   - Open your Supabase project
   - Go to **SQL Editor**
   - Create new query
   - Copy contents from `setup_msg91_phone_auth.sql`
   - Click **Run**

2. **Verify Tables Created:**
   ```sql
   SELECT * FROM phone_otp;
   SELECT * FROM phone_auth_logs;
   ```

### Step 4: Deploy Supabase Edge Function (3 minutes)

#### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Deploy the function:**
   ```bash
   supabase functions deploy send-otp-msg91
   ```

5. **Set secrets:**
   ```bash
   supabase secrets set MSG91_AUTH_KEY=your-auth-key
   supabase secrets set MSG91_SENDER_ID=MSGIND
   supabase secrets set MSG91_TEMPLATE_ID=your-template-id
   ```

#### Option B: Manual Deployment via Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **"Create Function"**
3. Name it: `send-otp-msg91`
4. Copy code from `supabase_functions/send-otp-msg91/index.ts`
5. Click **Deploy**
6. Go to **Settings** → **Edge Functions**
7. Add environment variables:
   - `MSG91_AUTH_KEY`
   - `MSG91_SENDER_ID`
   - `MSG91_TEMPLATE_ID`

### Step 5: Update Environment Variables (2 minutes)

Add to your `.env` file:

```env
# MSG91 Configuration
VITE_MSG91_AUTH_KEY=your-msg91-auth-key
VITE_MSG91_SENDER_ID=MSGIND
VITE_MSG91_TEMPLATE_ID=your-template-id

# Phone Authentication
VITE_PHONE_AUTH_ENABLED=true
VITE_PHONE_AUTH_COUNTRY_CODE=+91
VITE_PHONE_AUTH_COUNTRY=IN
```

**Note:** The MSG91 credentials are also needed in Supabase Edge Function secrets (Step 4).

### Step 6: Test the Integration

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test with your phone:**
   - Go to login page
   - Click **"Sign in with Phone"**
   - Enter your Indian mobile number
   - Click **"Send OTP"**
   - Check SMS on your phone
   - Enter OTP and verify

3. **Check logs:**
   - Supabase Dashboard → Edge Functions → Logs
   - Check for any errors

---

## Features

### Phone Authentication Features
- ✅ OTP generation and delivery via MSG91
- ✅ 6-digit OTP codes
- ✅ 5-minute expiration
- ✅ Rate limiting (5 attempts per hour)
- ✅ Automatic user creation/login
- ✅ Session management
- ✅ Resend OTP functionality

### Security Features
- ✅ OTP stored securely in database
- ✅ Rate limiting to prevent abuse
- ✅ Automatic cleanup of expired OTPs
- ✅ Attempt tracking
- ✅ Phone number validation
- ✅ DND compliance

### SMS Features (MSG91)
- ✅ High delivery rate in India
- ✅ Unicode SMS support (Hindi, etc.)
- ✅ Delivery reports
- ✅ Custom sender IDs
- ✅ Multiple templates
- ✅ Priority routing

---

## Testing

### Test Mode (Free)

For testing without using SMS credits, you can:

1. **Use Console Logs:**
   - Check Supabase Edge Function logs
   - OTP will be logged in development mode
   - Not recommended for production

2. **Test with Small Credits:**
   - Use MSG91 free credits
   - Test with your own number first
   - Verify delivery and timing

### Production Testing Checklist

- [ ] Test with multiple Indian carriers:
  - [ ] Jio
  - [ ] Airtel
  - [ ] Vodafone Idea
  - [ ] BSNL
- [ ] Test DND numbers (should work with OTP)
- [ ] Test international numbers (if needed)
- [ ] Test rate limiting (5+ requests)
- [ ] Test OTP expiration (wait 5+ minutes)
- [ ] Test wrong OTP entry (5+ times)
- [ ] Test resend functionality
- [ ] Check delivery time (should be < 10 seconds)

---

## Cost Estimation

### MSG91 Pricing (India)

| Volume | Price per SMS | Monthly Cost (2 OTPs/user/month) |
|--------|---------------|-----------------------------------|
| 0-10K | ₹0.30 | 1000 users = ₹600 |
| 10K-50K | ₹0.20 | 5000 users = ₹2,000 |
| 50K-1L | ₹0.15 | 10000 users = ₹3,000 |
| 1L+ | ₹0.10 | 50000 users = ₹10,000 |

### Example Scenarios

**Small Business (1000 users/month):**
- 2000 SMS per month (2 OTPs per user)
- Cost: ₹600/month (~$7/month)

**Medium Business (10,000 users/month):**
- 20,000 SMS per month
- Cost: ₹3,000/month (~$36/month)

**Large Business (50,000 users/month):**
- 100,000 SMS per month
- Cost: ₹10,000/month (~$120/month)

---

## MSG91 Dashboard

### Monitoring

1. **SMS Logs:**
   - Dashboard → Reports → SMS Logs
   - See all sent SMS with status
   - Delivery time and carrier info

2. **Analytics:**
   - Dashboard → Analytics
   - Delivery rates
   - Failed SMS reasons
   - Peak usage times

3. **Balance:**
   - Dashboard shows current balance
   - Set up low balance alerts
   - Auto-recharge available

### Sender IDs

1. **Default Sender ID:**
   - `MSGIND` - Available immediately
   - Generic sender ID
   - Good for testing

2. **Custom Sender ID:**
   - 6 characters (e.g., `YOURCO`)
   - Requires KYC approval
   - Better brand recognition
   - Takes 1-2 business days to approve

3. **Create Custom Sender ID:**
   - Dashboard → Sender ID → Create
   - Enter 6-character ID
   - Submit documents
   - Wait for approval

---

## Troubleshooting

### OTP Not Received

**Check 1: MSG91 Dashboard**
- Go to Dashboard → Reports → SMS Logs
- Search for the phone number
- Check delivery status:
  - **Delivered** - SMS sent successfully
  - **Failed** - Check failure reason
  - **Pending** - Wait a few seconds
  - **Rejected** - Check template/sender ID

**Check 2: Supabase Logs**
- Supabase Dashboard → Edge Functions → Logs
- Look for errors in `send-otp-msg91` function
- Check if API call to MSG91 was made

**Check 3: Phone Number**
- Must be valid Indian number
- 10 digits starting with 6, 7, 8, or 9
- Format: +919876543210

**Check 4: Template Approval**
- MSG91 Dashboard → Templates
- Ensure template status is **"Approved"**
- Pending templates won't send SMS

**Check 5: Balance**
- Check MSG91 balance
- Ensure sufficient credits
- Set up auto-recharge

### OTP Delivery Delayed

**Common Causes:**
1. **Network congestion** - Peak hours (9 AM - 9 PM)
2. **Carrier delays** - Some carriers are slower
3. **DND settings** - Transactional OTPs should work
4. **Phone turned off** - SMS queued for delivery

**Solutions:**
- Most SMS deliver within 5-10 seconds
- Wait up to 60 seconds before resending
- Check carrier-specific delivery times

### Invalid Auth Key Error

```
Error: Invalid Auth Key
```

**Solution:**
1. Verify auth key in MSG91 Dashboard
2. Check `.env` file has correct key
3. Update Supabase Edge Function secrets:
   ```bash
   supabase secrets set MSG91_AUTH_KEY=your-correct-key
   ```
4. Redeploy the function

### Template Not Found Error

```
Error: Template not found
```

**Solution:**
1. Check MSG91 Dashboard → Templates
2. Ensure template is **approved**
3. Copy correct Template ID
4. Update environment variables:
   ```bash
   supabase secrets set MSG91_TEMPLATE_ID=correct-id
   ```

### Rate Limit Exceeded

```
Error: Too many attempts
```

**Solution:**
- Wait 1 hour before retrying
- Or clear rate limit in database:
  ```sql
  DELETE FROM phone_auth_logs 
  WHERE phone = '+919876543210';
  ```

### Function Not Found

```
Error: Function not found
```

**Solution:**
1. Verify function is deployed:
   ```bash
   supabase functions list
   ```
2. If not listed, deploy again:
   ```bash
   supabase functions deploy send-otp-msg91
   ```
3. Check function URL in code matches deployment

---

## Production Checklist

### Before Going Live

- [ ] MSG91 account KYC completed and approved
- [ ] Custom sender ID approved (optional but recommended)
- [ ] OTP template approved
- [ ] Sufficient MSG91 balance loaded
- [ ] Auto-recharge setup (optional)
- [ ] Low balance alerts configured
- [ ] Edge function deployed to production
- [ ] Edge function secrets configured
- [ ] Database tables created
- [ ] Environment variables updated
- [ ] Tested with all major carriers
- [ ] Rate limiting tested
- [ ] OTP expiration tested
- [ ] Error handling tested
- [ ] Logs and monitoring setup
- [ ] Backup SMS provider (optional)

### Monitoring

1. **Daily Checks:**
   - Check MSG91 balance
   - Review delivery rates
   - Check failed SMS reasons

2. **Weekly Analysis:**
   - Review authentication stats
   - Check peak usage times
   - Optimize costs if needed

3. **Set Up Alerts:**
   - Low balance alert
   - High failure rate alert
   - Unusual activity alert

---

## Advanced Features

### Custom SMS Templates

Create different templates for different scenarios:

1. **Login OTP:**
   ```
   Your login code is ##OTP##. Valid for 5 minutes.
   ```

2. **Registration OTP:**
   ```
   Welcome! Your registration code is ##OTP##. Valid for 5 minutes.
   ```

3. **Transaction OTP:**
   ```
   Your order confirmation code is ##OTP##. Do not share.
   ```

### Multi-Language Support

MSG91 supports Unicode SMS for regional languages:

```
आपका OTP ##OTP## है। 5 मिनट के लिए मान्य।
```

**Note:** Unicode SMS costs 2x normal SMS (counted as 2 messages)

### Voice OTP

MSG91 also supports Voice OTP as fallback:

1. Go to MSG91 Dashboard → Voice
2. Enable Voice OTP
3. Implement fallback in your app
4. Voice OTP is more expensive but more reliable

### WhatsApp OTP (Future)

MSG91 supports WhatsApp OTP:
- Much cheaper (₹0.01 per message)
- Higher open rates
- Requires WhatsApp Business API approval
- Coming soon to this integration

---

## Database Queries

### View Recent OTPs
```sql
SELECT 
  phone, 
  otp, 
  verified, 
  attempts,
  created_at, 
  expires_at
FROM phone_otp 
ORDER BY created_at DESC 
LIMIT 20;
```

### Check Authentication Stats
```sql
SELECT * FROM get_phone_auth_stats('+919876543210');
```

### View Failed Attempts
```sql
SELECT 
  phone,
  action,
  error_message,
  created_at
FROM phone_auth_logs
WHERE success = false
ORDER BY created_at DESC
LIMIT 50;
```

### Cleanup Expired OTPs
```sql
SELECT cleanup_expired_otps();
```

### Check Rate Limit Status
```sql
SELECT check_phone_rate_limit('+919876543210', 5, 60);
```

---

## Security Best Practices

### OTP Security
1. **Never log OTPs in production**
2. Use HTTPS for all API calls
3. Implement rate limiting
4. Set appropriate OTP expiration (5 minutes)
5. Limit verification attempts (5 attempts)

### Phone Number Security
1. Validate phone numbers on client and server
2. Store phone numbers in E.164 format
3. Hash phone numbers in logs (optional)
4. Implement account lockout after repeated failures

### API Key Security
1. Never commit API keys to Git
2. Use environment variables
3. Rotate keys periodically
4. Use different keys for dev/production
5. Store keys in Supabase secrets

---

## Migration from Twilio

If you're migrating from Twilio to MSG91:

1. **Backup Current Setup:**
   - Export user phone numbers
   - Save Twilio configuration
   - Document current flow

2. **Run Both in Parallel** (Optional):
   - Keep Twilio as fallback
   - Gradually migrate users
   - Monitor delivery rates

3. **Switch to MSG91:**
   - Deploy MSG91 setup
   - Test thoroughly
   - Switch environment variables
   - Monitor for 24 hours

4. **Decommission Twilio:**
   - Cancel Twilio subscription
   - Remove Twilio credentials
   - Update documentation

---

## Support

### MSG91 Support
- **Website:** https://msg91.com/
- **Support:** https://msg91.com/help
- **Email:** support@msg91.com
- **Phone:** +91-9650340007
- **Chat:** Available in dashboard

### Developer Resources
- **API Docs:** https://docs.msg91.com/
- **Sample Code:** https://github.com/msg91
- **SDKs:** Available for Node.js, Python, PHP, Java

### Common Questions

**Q: How long does KYC take?**
A: Usually 1-2 business days

**Q: Can I use MSG91 for international SMS?**
A: Yes, but rates are higher outside India

**Q: What if SMS fails?**
A: MSG91 provides detailed failure reasons in logs

**Q: Can I get a refund for failed SMS?**
A: Yes, failed SMS are not charged

**Q: How do I increase my sending limit?**
A: Contact MSG91 support with your use case

---

## Next Steps

1. ✅ Complete MSG91 setup
2. ✅ Deploy Edge Function
3. ✅ Test phone authentication
4. 📱 Test with multiple carriers
5. 📊 Monitor delivery rates
6. 💰 Optimize costs
7. 🔄 Setup auto-recharge
8. 📈 Scale as needed

---

## Related Files

- `supabase_functions/send-otp-msg91/index.ts` - Edge Function
- `setup_msg91_phone_auth.sql` - Database setup
- `src/services/phoneAuthService.ts` - Frontend service
- `src/components/auth/PhoneLogin.tsx` - UI component
- `env.template` - Environment variables

---

**Happy Coding! 🚀**

For support or questions, check the troubleshooting section or contact MSG91 support.

