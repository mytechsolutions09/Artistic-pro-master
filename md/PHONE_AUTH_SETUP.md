# Mobile OTP Authentication Setup Guide

## Overview

This guide helps you set up mobile phone OTP authentication for Indian users using **MSG91** SMS service. MSG91 is much more cost-effective than Twilio for Indian SMS delivery.

> **⚠️ Important:** This project now uses MSG91 instead of Twilio for better pricing and delivery in India.

## Why MSG91 Over Twilio?

### Cost Comparison
- **MSG91:** ₹0.10-0.30 per SMS (70-90% cheaper)
- **Twilio:** ₹0.50-1.50 per SMS
- **No monthly rental fees** with MSG91

### Benefits
- ✅ Better delivery rates in India
- ✅ Excellent coverage (Jio, Airtel, Vodafone, BSNL)
- ✅ 24/7 Indian support
- ✅ DND-compliant delivery

## Prerequisites

- Supabase project
- MSG91 account (sign up at https://msg91.com/)
- Indian phone numbers start with +91
- Supabase CLI (optional, for deploying Edge Functions)

## Step 1: Create MSG91 Account

### 1.1 Sign Up

1. Visit: https://msg91.com/
2. Click "Sign Up"
3. Complete registration with:
   - Name
   - Email
   - Indian phone number
   - Company details

### 1.2 Get Credentials

1. **Auth Key:**
   - Dashboard → Settings → API Keys
   - Copy your Auth Key

2. **Sender ID:**
   - For testing: Use `MSGIND` (default)
   - For production: Create custom sender ID (requires KYC)

3. **Template ID:**
   - Dashboard → SMS → Templates
   - Create OTP template:
     ```
     Your verification code is ##OTP##. Valid for 5 minutes. Do not share with anyone.
     ```
   - Submit for approval
   - Copy Template ID once approved

## Step 2: Setup Database

### 2.1 Run SQL Script

1. Open Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents from `setup_msg91_phone_auth.sql`
4. Click **Run**

This creates:
- `phone_otp` - Stores OTP codes
- `phone_auth_logs` - Logs authentication attempts
- Helper functions for rate limiting and cleanup

## Step 3: Deploy Edge Function

### 3.1 Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-otp-msg91

# Set secrets
supabase secrets set MSG91_AUTH_KEY=your-auth-key
supabase secrets set MSG91_SENDER_ID=MSGIND
supabase secrets set MSG91_TEMPLATE_ID=your-template-id
```

### 3.2 Manual Deployment (Alternative)

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create Function"
3. Name: `send-otp-msg91`
4. Copy code from `supabase_functions/send-otp-msg91/index.ts`
5. Deploy
6. Add environment variables in function settings

## Step 4: Add Environment Variables

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

## Step 5: Test Phone Authentication

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Test with Real Phone

1. Go to your login page
2. Click **"Sign in with Phone"** tab
3. Enter Indian mobile number (e.g., `9876543210`)
4. Click **"Send OTP"**
5. Check SMS for 6-digit OTP
6. Enter OTP and submit

### 5.3 Verify Logs

- **MSG91 Dashboard:** Check SMS delivery logs
- **Supabase:** Check Edge Function logs

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

### MSG91 Costs (India) - NOW USING THIS! ✅
- **SMS Cost:** ₹0.10-0.30 per message
- **No monthly rental fees**
- **Free credits** for new accounts
- **Example:** 1000 users × 2 OTPs = ₹200-600/month

### Previous Provider (Twilio)
- **SMS Cost:** ₹0.50-1.50 per message (3-5x more expensive)
- **Monthly rental:** ~₹750/month
- **Example:** 1000 users × 2 OTPs = ₹1000-3000/month + ₹750

### Cost Savings with MSG91
- **70-90% cheaper** than Twilio
- **No monthly fees**
- **Better delivery rates in India**

## Why We Switched to MSG91

1. **Much Cheaper:** Up to 90% cost reduction
2. **Better for India:** Optimized routing for Indian carriers
3. **No Monthly Fees:** Pay only for what you use
4. **Faster Delivery:** <10 second delivery time
5. **DND Compliance:** OTP SMS work even on DND numbers
6. **Indian Support:** 24/7 support in IST timezone

## Troubleshooting

### OTP Not Received

**Check 1: MSG91 Dashboard**
- Go to MSG91 Dashboard → Reports → SMS Logs
- Search for your phone number
- Check delivery status (Delivered/Failed/Pending)

**Check 2: Supabase Edge Function**
- Go to Supabase Dashboard → Edge Functions → Logs
- Check `send-otp-msg91` function logs
- Look for error messages

**Check 3: Phone Number Format**
- Must be valid Indian number
- 10 digits after +91
- Example: +919876543210

**Check 4: MSG91 Configuration**
- Verify Auth Key is correct
- Check template is approved
- Verify sufficient balance

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

- [ ] MSG91 account created
- [ ] MSG91 credentials obtained
- [ ] Database tables created
- [ ] Edge function deployed
- [ ] Secrets configured in Supabase
- [ ] Environment variables added
- [ ] OTP SMS received
- [ ] OTP verification successful
- [ ] User session created
- [ ] Login persists after refresh
- [ ] Logout works correctly
- [ ] Rate limiting works
- [ ] Error messages display properly

## Production Checklist

- [ ] Complete MSG91 KYC verification
- [ ] Get custom sender ID (optional)
- [ ] Template approved by MSG91
- [ ] Load sufficient balance in MSG91
- [ ] Setup auto-recharge (optional)
- [ ] Deploy Edge Function to production
- [ ] Configure production secrets
- [ ] Set up proper error logging
- [ ] Monitor SMS delivery rates
- [ ] Set up low balance alerts
- [ ] Test with multiple networks (Jio, Airtel, Vodafone, BSNL)
- [ ] Add phone number to user profile
- [ ] Allow users to update phone number
- [ ] Implement phone verification badge

## Cost Optimization

### Reduce SMS Costs with MSG91

1. **Volume discounts** - Higher volume = lower per-SMS cost
2. **Cache OTPs properly** - Don't send duplicate OTPs
3. **Rate limiting** - Prevent abuse and unnecessary sends
4. **Longer OTP validity** - Reduce resends (balance with security)
5. **Monitor delivery rates** - Identify and fix issues quickly

### Estimated Costs with MSG91

| Users/Month | SMS/Month | Cost (MSG91) | Cost (Twilio) | Savings |
|-------------|-----------|--------------|---------------|---------|
| 1,000 | 2,000 | ₹200-600 | ₹1,000-3,000 | 70-80% |
| 5,000 | 10,000 | ₹1,000-2,000 | ₹5,000-15,000 | 80-87% |
| 10,000 | 20,000 | ₹2,000-3,000 | ₹10,000-30,000 | 85-90% |

**Assuming 2 OTPs per user per month (1 login + 1 resend)**

## Next Steps

1. Test the phone login feature
2. Monitor SMS delivery rates
3. Add phone number to user profiles
4. Consider adding WhatsApp OTP (future)
5. Implement 2FA with phone numbers

## Support

### For Issues:
1. Check MSG91 Dashboard → SMS Logs
2. Check Supabase Edge Function logs
3. Review browser console
4. Test with your own number first
5. Verify MSG91 credentials
6. Check database tables

### MSG91 Support:
- **Website:** https://msg91.com/help
- **Email:** support@msg91.com
- **Phone:** +91-9650340007
- **Chat:** Available in dashboard

## Related Files

### Implementation Files:
- `src/services/phoneAuthService.ts` - Phone auth operations (uses MSG91)
- `src/components/auth/PhoneLogin.tsx` - Phone login UI
- `supabase_functions/send-otp-msg91/index.ts` - MSG91 Edge Function
- `setup_msg91_phone_auth.sql` - Database setup

### Documentation:
- `MSG91_PHONE_AUTH_SETUP.md` - Detailed MSG91 setup guide
- `MSG91_QUICK_START.md` - Quick 15-minute setup
- `PHONE_AUTH_SETUP.md` - This file
- `env.template` - Environment variables template
