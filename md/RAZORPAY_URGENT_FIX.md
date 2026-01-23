# 🔴 URGENT: Razorpay 400 Error Fix

## The Problem

You're getting `400 Bad Request` from Razorpay because:
- ✅ You're using **LIVE keys** (`rzp_live_RQZfBX0KJno9Hd`)
- ❌ But creating **MOCK order IDs** (`order_1759847533125_pgav4zh6k`)

**Razorpay's live mode REQUIRES real orders created through their API.**

## Immediate Solution (5 minutes)

### Step 1: Switch to Test Keys

Update your `.env` file:

```env
# CHANGE THIS LINE - Replace with your test key
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX

# CHANGE THIS LINE - Replace with your test secret
VITE_RAZORPAY_KEY_SECRET=your_test_secret_key

# Keep these the same
VITE_RAZORPAY_CURRENCY=INR
VITE_RAZORPAY_COMPANY_NAME=Lurevi
VITE_RAZORPAY_COMPANY_LOGO=https://lurevi.in/lurevi-logo.svg
VITE_RAZORPAY_THEME_COLOR=#0d9488
```

### Step 2: Get Your Test Keys

1. Go to https://dashboard.razorpay.com/
2. **Toggle to "Test Mode"** (switch at the top)
3. Go to **Settings** → **API Keys**
4. Click **"Generate Test Keys"** if you don't have them
5. Copy both:
   - Key ID (starts with `rzp_test_`)
   - Key Secret

### Step 3: Restart Your Server

```bash
# Stop your dev server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Test with Test Cards

Use these test card details:

**Card Number:** `4111 1111 1111 1111`  
**CVV:** Any 3 digits (e.g., `123`)  
**Expiry:** Any future date (e.g., `12/25`)  
**OTP:** `1234` (for test mode)

## Why This Works

- ✅ Test mode accepts mock order IDs
- ✅ No backend API needed
- ✅ Full payment flow testing
- ✅ No real money transactions
- ✅ Instant setup

## For Production (Later)

To use live keys in production, you MUST:

1. **Create a backend API** (Supabase Edge Function or Node.js)
2. **Call Razorpay's Order API** to create real orders
3. **Pass the real order ID** to the frontend

### Example Backend Call:

```javascript
// Backend API endpoint
const response = await fetch('https://api.razorpay.com/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa(`${KEY_ID}:${KEY_SECRET}`),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 32000, // in paise (₹320)
    currency: 'INR',
    receipt: 'order_123'
  })
});

const order = await response.json();
// order.id will be like: order_MhVxKJZwvXXXXX
```

## Quick Checklist

- [ ] Switched to test keys in `.env`
- [ ] Restarted dev server
- [ ] Tested checkout with test card
- [ ] Payment works successfully
- [ ] Plan backend integration for production

## Still Getting Errors?

### Check 1: Verify Keys Are Test Keys
```bash
# Your key should start with rzp_test_
echo $VITE_RAZORPAY_KEY_ID
```

### Check 2: Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R`
- Or clear cache completely

### Check 3: Check Console for Key
Open browser console and check if test key is being used:
```javascript
console.log(import.meta.env.VITE_RAZORPAY_KEY_ID)
```

## Need Help?

See these files:
- `RAZORPAY_400_ERROR_FIX.md` - Detailed solutions
- `create_razorpay_backend_function.sql` - Database function workaround
- `RAZORPAY_INTEGRATION.md` - Full integration guide

## Summary

**Right now:** Use test keys → Works immediately  
**For production:** Need backend API → Plan for later

**The fix is literally just changing one line in your `.env` file!**
