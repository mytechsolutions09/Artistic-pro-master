# Phone OTP Authentication - Quick Start Guide (MSG91)

> **🎉 Now using MSG91 for 70-90% cost savings!**

## Quick Setup (15 Minutes)

### Step 1: Create MSG91 Account (5 minutes)

1. **Sign up:** https://msg91.com/
2. **Verify** your email and phone
3. **Get credentials:**
   - Dashboard → Settings → API Keys → Copy **Auth Key**
   - Note default Sender ID: `MSGIND`
   - Create OTP template → Get **Template ID**

### Step 2: Setup Database (2 minutes)

1. Go to Supabase Dashboard → **SQL Editor**
2. Create new query
3. Copy contents from `setup_msg91_phone_auth.sql`
4. Click **Run**

### Step 3: Deploy Edge Function (5 minutes)

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy send-otp-msg91

# Set secrets
supabase secrets set MSG91_AUTH_KEY=your-auth-key
supabase secrets set MSG91_SENDER_ID=MSGIND
supabase secrets set MSG91_TEMPLATE_ID=your-template-id
```

### Step 4: Update Environment Variables (2 minutes)

Add to your `.env`:

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

### Step 5: Test It (3 minutes)

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to your login page
3. Click **Phone** tab
4. Enter your real Indian mobile number
5. Click **Send OTP**
6. Check SMS on your phone (arrives in <10 seconds)
7. Enter the 6-digit OTP
8. Click **Verify & Login**

You should be logged in! 🎉

## What Was Installed

### New Files Created
- ✅ `supabase_functions/send-otp-msg91/index.ts` - MSG91 Edge Function
- ✅ `setup_msg91_phone_auth.sql` - Database setup for MSG91
- ✅ `MSG91_PHONE_AUTH_SETUP.md` - Detailed MSG91 guide
- ✅ `MSG91_QUICK_START.md` - Quick setup guide
- ✅ `src/services/phoneAuthService.ts` - Phone auth service
- ✅ `src/components/auth/PhoneLogin.tsx` - Phone login UI

### Files Modified
- ✅ `PHONE_AUTH_SETUP.md` - Updated for MSG91
- ✅ `PHONE_AUTH_QUICK_START.md` - This file (updated for MSG91)
- ✅ `env.template` - Added MSG91 variables

## Features

### User Features
- 📱 Login with Indian mobile number (+91)
- 🔐 6-digit OTP via SMS
- ⏱️ 60-second resend cooldown
- ✅ Auto-format phone numbers
- 🔄 Resend OTP option
- 🎨 Beautiful, modern UI

### Security Features
- 🛡️ Rate limiting (5 attempts/hour)
- ⏰ OTP expiration (5 minutes)
- 🔒 One-time use OTPs
- 📊 Audit logging
- ✅ Phone number validation

## Testing

### With Test Number (Free)
- Phone: `9999999999`
- OTP: `123456`
- No SMS sent, instant login

### With Real Number (Uses SMS Credits)
1. Enter your real Indian mobile number
2. Receive real SMS with OTP
3. Enter OTP to login

## Cost Estimates (Now Using MSG91! ✅)

### MSG91 (India) - CURRENT PROVIDER
- **SMS Cost:** ₹0.10-0.30 per message
- **No monthly rental** (unlike Twilio)
- **Free credits** for new accounts
- **Example:** 1000 users = ₹200-600/month

### Previous Provider: Twilio
- **SMS Cost:** ₹0.50-1.50 per message (5x more expensive!)
- **Monthly Rental:** ₹750/month
- **Example:** 1000 users = ₹1,000-3,000/month + ₹750

### Cost Savings
**You save 70-90% by using MSG91!** 🎉

## Production Checklist

Before going live:

- [ ] Complete MSG91 KYC verification
- [ ] Get custom sender ID (optional)
- [ ] Template approved by MSG91
- [ ] Load sufficient balance in MSG91 account
- [ ] Setup auto-recharge (optional)
- [ ] Test with multiple Indian carriers (Jio, Airtel, Vodafone, BSNL)
- [ ] Set up MSG91 low balance alerts
- [ ] Monitor `phone_auth_logs` table
- [ ] Set up error notifications
- [ ] Add phone number to user profiles
- [ ] Test rate limiting
- [ ] Verify OTP expiration works
- [ ] Check SMS delivery rates in MSG91 dashboard

## Troubleshooting

### OTP Not Received

**Solution 1:** Check MSG91 Dashboard
- Go to MSG91 Dashboard → Reports → SMS Logs
- Search for your phone number
- Check delivery status

**Solution 2:** Check Supabase Logs
- Go to Supabase → Edge Functions → Logs
- Look for `send-otp-msg91` function
- Check for errors

**Solution 3:** Verify Phone Number
- Must be valid Indian number (10 digits)
- Must start with 6, 7, 8, or 9
- Format: +919876543210 (no spaces)

**Solution 4:** Check MSG91 Account
- Verify template is approved
- Check balance
- Verify Auth Key is correct

### Invalid Phone Number Error

Error message: `"Invalid Indian phone number"`

**Solution:**
- Remove +91 prefix when entering
- Just enter 10 digits (e.g., `9876543210`)
- Must start with 6, 7, 8, or 9

### Rate Limit Error

Error message: `"Too many attempts"`

**Solution:**
- Wait 1 hour
- Or clear rate limit in database:
  ```sql
  DELETE FROM phone_auth_logs WHERE phone = '+919876543210';
  ```

### OTP Expired

Error message: `"OTP has expired"`

**Solution:**
- Click "Resend OTP"
- OTPs expire after 5 minutes
- Each OTP can only be used once

## Next Steps

### Add to Sign Up Page

The phone login is currently only on the login page. To add it to sign up:

1. Import `PhoneLogin` component
2. Add tab switcher
3. Handle phone-based registration
4. Collect additional user info (name, etc.)

### Add Phone to User Profile

Allow users to:
- Add/update phone number
- Verify phone number
- Use for 2FA
- Receive order notifications

### Implement 2FA

Use phone OTP as a second factor:
- Enable in user settings
- Require OTP after password
- Backup codes for emergencies

## Support

### Documentation
- `PHONE_AUTH_SETUP.md` - Full documentation
- `setup_phone_authentication.sql` - Database schema

### Common Issues
- SMS not delivered → Check MSG91 Dashboard logs
- Function error → Check Supabase Edge Function logs
- Invalid Auth Key → Update secrets in Supabase
- Template not found → Verify template is approved
- Invalid number → Check format (+919876543210)
- Rate limited → Wait or clear logs
- OTP expired → Request new OTP

### Monitoring

Check phone auth stats:
```sql
SELECT * FROM phone_auth_stats ORDER BY date DESC LIMIT 7;
```

View recent logs:
```sql
SELECT * FROM phone_auth_logs ORDER BY created_at DESC LIMIT 20;
```

## Success!

You now have phone OTP authentication working! 

Users can login with either:
- ✅ Email + Password
- ✅ Phone + OTP

Both methods work seamlessly and use the same user accounts.

