# MSG91 Phone Authentication - Quick Start (15 Minutes)

## ⚡ Super Quick Setup

### Step 1: MSG91 Account (5 min)
1. Sign up: https://msg91.com/
2. Get your **Auth Key** (Settings → API Keys)
3. Note default Sender ID: `MSGIND`
4. Create OTP template and get **Template ID**

### Step 2: Database Setup (2 min)
```bash
# In Supabase SQL Editor, run:
```
Copy contents from `setup_msg91_phone_auth.sql` and execute.

### Step 3: Deploy Edge Function (3 min)
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

### Step 4: Environment Variables (2 min)
Add to `.env`:
```env
VITE_MSG91_AUTH_KEY=your-msg91-auth-key
VITE_MSG91_SENDER_ID=MSGIND
VITE_MSG91_TEMPLATE_ID=your-template-id
VITE_PHONE_AUTH_ENABLED=true
VITE_PHONE_AUTH_COUNTRY_CODE=+91
VITE_PHONE_AUTH_COUNTRY=IN
```

### Step 5: Test (3 min)
```bash
npm run dev
```
Go to login → Enter phone → Get OTP → Verify!

---

## 💰 Cost Comparison

| Provider | Cost per SMS | Monthly (1000 users) |
|----------|--------------|----------------------|
| **MSG91** | ₹0.10-0.30 | ₹200-600 |
| Twilio | ₹0.50-1.50 | ₹1000-3000 |
| **Savings** | **70-90%** | **₹400-2400** |

---

## ✅ What You Get

- ✅ **Cheaper:** 70-90% cost reduction
- ✅ **Better delivery:** Optimized for India
- ✅ **No monthly fees:** Unlike Twilio
- ✅ **Fast:** <10 second delivery
- ✅ **Reliable:** 99%+ delivery rate
- ✅ **Indian support:** 24/7 in your timezone

---

## 🎯 Files Created/Modified

### New Files:
- `supabase_functions/send-otp-msg91/index.ts` - Edge Function
- `setup_msg91_phone_auth.sql` - Database schema
- `MSG91_PHONE_AUTH_SETUP.md` - Detailed guide
- `MSG91_QUICK_START.md` - This file

### Modified Files:
- `src/services/phoneAuthService.ts` - Now uses MSG91
- `env.template` - Added MSG91 variables

---

## 🧪 Testing Checklist

- [ ] Database tables created (run SQL)
- [ ] Edge function deployed
- [ ] Secrets configured in Supabase
- [ ] Environment variables added
- [ ] Dev server restarted
- [ ] OTP received on phone
- [ ] OTP verification works
- [ ] Login successful

---

## 🔧 Troubleshooting

### OTP Not Received?
1. Check MSG91 Dashboard → SMS Logs
2. Check Supabase → Edge Functions → Logs
3. Verify template is approved
4. Check MSG91 balance

### Function Error?
```bash
# Check function logs
supabase functions logs send-otp-msg91

# Redeploy if needed
supabase functions deploy send-otp-msg91
```

### Invalid Auth Key?
```bash
# Update secret
supabase secrets set MSG91_AUTH_KEY=correct-key
```

---

## 📚 Full Documentation

For detailed setup, troubleshooting, and advanced features:
- **Detailed Guide:** `MSG91_PHONE_AUTH_SETUP.md`
- **MSG91 Docs:** https://docs.msg91.com/

---

## 🚀 Next Steps

1. Test with your phone
2. Test with different carriers (Jio, Airtel, Vodafone)
3. Complete KYC for production
4. Get custom sender ID (optional)
5. Setup monitoring and alerts
6. Go live!

---

## 💬 Support

**MSG91 Support:**
- Website: https://msg91.com/help
- Email: support@msg91.com
- Phone: +91-9650340007

**Need Help?**
Check the detailed guide: `MSG91_PHONE_AUTH_SETUP.md`

---

**Happy Coding! 🎉**

MSG91 integration is much easier and cheaper than Twilio for Indian SMS!

