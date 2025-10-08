# Phone OTP Authentication - Quick Start Guide

## Quick Setup (10 Minutes)

### Step 1: Enable Phone Auth in Supabase (3 minutes)

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Phone** in the list
5. Toggle **"Enable Phone provider"** to ON
6. Save changes

### Step 2: Configure Twilio (5 minutes)

#### Get Twilio Account (Free Trial)

1. Sign up at https://www.twilio.com/try-twilio
2. Verify your email and phone
3. You get **$15 free credit**

#### Get Twilio Credentials

From Twilio Console Dashboard:
- Copy **Account SID**
- Copy **Auth Token**
- Get a **Phone Number** (choose one with SMS capability for India)

#### Configure in Supabase

Back in Supabase Dashboard:
1. Still in **Authentication** → **Providers** → **Phone**
2. Select **Twilio** as the provider
3. Paste your:
   - Account SID
   - Auth Token
   - Twilio Phone Number
4. Click **Save**

### Step 3: Add Test Number (Optional, 1 minute)

For testing without using SMS credits:

1. In Supabase Dashboard: **Authentication** → **Settings**
2. Scroll to **"Phone Auth Test Numbers"**
3. Click **"Add Test Number"**
4. Add:
   - Phone: `+919999999999`
   - OTP: `123456`
5. Save

### Step 4: Update Your .env File (1 minute)

Add these lines to your `.env`:

```env
VITE_PHONE_AUTH_ENABLED=true
VITE_PHONE_AUTH_COUNTRY_CODE=+91
VITE_PHONE_AUTH_COUNTRY=IN
```

### Step 5: Run Database Setup (30 seconds)

Run the SQL script in Supabase:

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy contents from `setup_phone_authentication.sql`
4. Click **Run**

### Step 6: Test It

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to your login page
3. You'll see two tabs: **Email** and **Phone**
4. Click **Phone** tab
5. Enter test number: `9999999999`
6. Click **Send OTP**
7. Enter OTP: `123456`
8. Click **Verify & Login**

You should be logged in!

## What Was Installed

### Files Created
- ✅ `src/services/phoneAuthService.ts` - OTP sending/verification
- ✅ `src/components/auth/PhoneLogin.tsx` - Phone login UI
- ✅ `setup_phone_authentication.sql` - Database setup
- ✅ `PHONE_AUTH_SETUP.md` - Detailed guide
- ✅ `PHONE_AUTH_QUICK_START.md` - This guide

### Files Modified
- ✅ `src/components/auth/LoginForm.tsx` - Added phone tab
- ✅ `env.template` - Added phone auth settings

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

## Cost Estimates

### Twilio (India)
- **SMS Cost:** ₹0.50-1.50 per message
- **Free Trial:** $15 credit (~1000 SMS)
- **Monthly Rental:** ~₹750/month for phone number

### Alternative: MSG91 (Cheaper for India)
- **SMS Cost:** ₹0.10-0.30 per message
- **No monthly rental**
- **Better Indian coverage**

Note: Supabase doesn't have built-in MSG91 support. You'd need to implement custom SMS sending.

## Production Checklist

Before going live:

- [ ] Switch from test to production Twilio keys
- [ ] Remove test phone numbers
- [ ] Test with multiple Indian carriers (Jio, Airtel, Vodafone)
- [ ] Set up Twilio billing alerts
- [ ] Monitor `phone_auth_logs` table
- [ ] Set up error notifications
- [ ] Add phone number to user profiles
- [ ] Test rate limiting
- [ ] Verify OTP expiration works
- [ ] Check SMS delivery rates

## Troubleshooting

### OTP Not Received

**Solution 1:** Check Twilio Console
- Go to Twilio → Messaging → Logs
- Look for your SMS
- Check delivery status

**Solution 2:** Verify Phone Number
- Must be valid Indian number (10 digits)
- Must start with 6, 7, 8, or 9
- Format: +919876543210 (no spaces)

**Solution 3:** Check Twilio Account
- Verify account is active
- Check balance
- Ensure phone number has SMS capability

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
- SMS not delivered → Check Twilio logs
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

