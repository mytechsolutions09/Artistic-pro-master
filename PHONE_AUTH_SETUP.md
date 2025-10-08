# Mobile OTP Authentication Setup Guide

## Overview

This guide helps you set up mobile phone OTP authentication for Indian users using Supabase Phone Auth.

## Prerequisites

- Supabase project
- SMS provider (Twilio recommended for India)
- Indian phone numbers start with +91

## Step 1: Enable Phone Authentication in Supabase

### 1.1 Go to Supabase Dashboard

1. Navigate to your project at https://app.supabase.com
2. Go to **Authentication** → **Providers**
3. Find **Phone** in the list

### 1.2 Enable Phone Provider

1. Toggle **Enable Phone provider** to ON
2. Choose your SMS provider (recommended: **Twilio**)

## Step 2: Configure Twilio (Recommended for India)

### 2.1 Create Twilio Account

1. Sign up at https://www.twilio.com/
2. Verify your account
3. Get a phone number with SMS capabilities for India

### 2.2 Get Twilio Credentials

From Twilio Console:
- **Account SID**
- **Auth Token**
- **Phone Number** (Twilio number)

### 2.3 Configure in Supabase

In Supabase Dashboard → Authentication → Providers → Phone:

```
Provider: Twilio
Account SID: [Your Account SID]
Auth Token: [Your Auth Token]
Twilio Phone Number: [Your Twilio Number]
```

Click **Save**

## Step 3: Add Environment Variables

Add to your `.env` file:

```env
# Phone Authentication
VITE_PHONE_AUTH_ENABLED=true
VITE_PHONE_AUTH_COUNTRY_CODE=+91
VITE_PHONE_AUTH_COUNTRY=IN
```

## Step 4: Update Auth Configuration

The phone authentication service and components have been created for you:

- `src/services/phoneAuthService.ts` - Phone OTP operations
- `src/components/auth/PhoneLogin.tsx` - Phone login UI
- Updated `src/contexts/AuthContext.tsx` - Phone auth support

## Step 5: Test Phone Authentication

### 5.1 Test Mode Numbers (Development)

Supabase allows test phone numbers in development:

**Phone:** `+91 9999999999`
**OTP:** `123456`

To set up test numbers:
1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to **Phone Auth Test Numbers**
3. Add test numbers and fixed OTPs

### 5.2 Real Testing

1. Go to your login page
2. Click **"Sign in with Phone"** tab
3. Enter Indian mobile number (e.g., `9876543210`)
4. Click **"Send OTP"**
5. Check SMS for 6-digit OTP
6. Enter OTP and submit

## Step 6: Configure SMS Templates (Optional)

### 6.1 Customize OTP Message

In Supabase Dashboard → Authentication → Email Templates → SMS:

```
Your Lurevi verification code is {{ .Token }}

Valid for 5 minutes.
```

## Features Implemented

### Phone Login Component
- ✅ Indian phone number validation (+91)
- ✅ 10-digit mobile number format
- ✅ OTP input (6 digits)
- ✅ Resend OTP with cooldown
- ✅ Loading states
- ✅ Error handling
- ✅ Rate limiting protection

### Auth Service
- ✅ Send OTP to phone number
- ✅ Verify OTP
- ✅ Resend OTP
- ✅ Phone number formatting
- ✅ Session management

### User Experience
- ✅ Tab-based UI (Email/Phone)
- ✅ Auto-format phone numbers
- ✅ OTP countdown timer
- ✅ Clear error messages
- ✅ Mobile-friendly design

## Security Features

### Rate Limiting
- Maximum 5 OTP attempts per hour per phone number
- Cooldown period between resends

### OTP Security
- 6-digit random OTP
- 5-minute expiration
- One-time use only
- Cannot reuse expired OTPs

### Phone Validation
- Format validation (10 digits)
- Indian country code (+91)
- No special characters
- Numeric only

## Pricing Considerations

### Twilio Costs (India)
- **Outbound SMS:** ~₹0.50-1.50 per message
- **Monthly phone rental:** ~₹750/month
- **Free trial:** $15 credit

### Alternative Providers
1. **MSG91** (India-specific)
   - Cheaper for Indian SMS
   - ~₹0.10-0.30 per SMS
   - Better Indian network coverage

2. **TextLocal**
   - India-focused
   - ~₹0.15-0.40 per SMS

3. **Vonage (Nexmo)**
   - Global provider
   - Similar to Twilio pricing

## Using MSG91 Instead of Twilio

If you prefer MSG91 (cheaper for India):

### 1. Sign up at MSG91
https://msg91.com/

### 2. Get Credentials
- Auth Key
- Sender ID

### 3. Configure in Supabase

Unfortunately, Supabase doesn't have built-in MSG91 support. You'll need to:

1. Use Twilio in Supabase (for auth infrastructure)
2. Or implement custom SMS via Edge Functions

For custom SMS with MSG91, see: `PHONE_AUTH_CUSTOM_SMS.md` (to be created if needed)

## Troubleshooting

### OTP Not Received

**Check 1: Twilio Console**
- Go to Twilio → Messaging → Logs
- Check if SMS was sent
- Look for delivery status

**Check 2: Phone Number Format**
- Must be valid Indian number
- 10 digits after +91
- Example: +919876543210

**Check 3: Twilio Account**
- Verify account is active
- Check balance
- Verify phone number is SMS-capable

### Invalid Phone Number Error

```
Error: Invalid phone number format
```

**Solution:**
- Use format: +919876543210
- No spaces or dashes
- Must start with +91
- Exactly 10 digits after country code

### OTP Expired

```
Error: Token has expired or is invalid
```

**Solution:**
- Request new OTP
- OTPs expire in 5 minutes
- Each OTP can only be used once

### Rate Limit Exceeded

```
Error: For security purposes, you can only request this once every 60 seconds
```

**Solution:**
- Wait 60 seconds before resending
- This prevents spam/abuse
- Use the countdown timer

## Testing Checklist

- [ ] Supabase phone auth enabled
- [ ] Twilio configured and connected
- [ ] Test phone number works
- [ ] OTP SMS received
- [ ] OTP verification successful
- [ ] User session created
- [ ] Login persists after refresh
- [ ] Logout works correctly
- [ ] Rate limiting works
- [ ] Error messages display properly

## Production Checklist

- [ ] Use real Twilio phone number
- [ ] Remove test phone numbers
- [ ] Set up proper error logging
- [ ] Monitor SMS delivery rates
- [ ] Set up billing alerts
- [ ] Add analytics tracking
- [ ] Test with multiple networks (Jio, Airtel, Vodafone)
- [ ] Add phone number to user profile
- [ ] Allow users to update phone number
- [ ] Implement phone verification badge

## Cost Optimization

### Reduce SMS Costs

1. **Cache OTPs properly** - Don't send duplicate OTPs
2. **Rate limiting** - Prevent abuse
3. **Use test numbers** in development
4. **Voice fallback** - Cheaper for some users
5. **Longer OTP validity** - Reduce resends (but less secure)

### Estimated Costs

For 1000 users/month with 2 logins each:
- **Twilio:** ~₹2000-3000/month
- **MSG91:** ~₹200-600/month

## Next Steps

1. Test the phone login feature
2. Monitor SMS delivery rates
3. Add phone number to user profiles
4. Consider adding WhatsApp OTP (future)
5. Implement 2FA with phone numbers

## Support

For issues:
1. Check Supabase logs
2. Check Twilio logs
3. Review browser console
4. Test with test numbers first
5. Verify Supabase RLS policies

## Related Files

- `src/services/phoneAuthService.ts` - Phone auth operations
- `src/components/auth/PhoneLogin.tsx` - Phone login UI
- `src/contexts/AuthContext.tsx` - Auth context with phone support
- `src/pages/Login.tsx` - Updated login page
- `env.template` - Environment variables template
