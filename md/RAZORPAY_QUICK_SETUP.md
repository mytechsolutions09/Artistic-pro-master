# Razorpay Quick Setup Guide

## Quick Start (5 minutes)

### Step 1: Get Razorpay Test Keys

1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up for a free account
3. Navigate to **Settings** → **API Keys**
4. Click **Generate Test Key**
5. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secure!)

### Step 2: Add Keys to .env File

Create or update your `.env` file in the project root:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
VITE_RAZORPAY_KEY_SECRET=your_secret_key_here

# Razorpay Settings (Optional - defaults provided)
VITE_RAZORPAY_CURRENCY=INR
VITE_RAZORPAY_COMPANY_NAME=Lurevi
VITE_RAZORPAY_COMPANY_LOGO=https://yourdomain.com/logo.png
VITE_RAZORPAY_THEME_COLOR=#0d9488
```

### Step 3: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Test Payment

1. Go to checkout page
2. Fill in customer details
3. Click "Proceed to Payment"
4. Use test credentials:

**Test Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Test UPI:**
- UPI ID: `success@razorpay` (for successful payment)
- UPI ID: `failure@razorpay` (for failed payment)

---

## Troubleshooting

### Error: "Failed to load Razorpay"

**Possible causes:**
1. Internet connection issue
2. Firewall/ad blocker blocking script
3. Browser extensions interfering

**Solutions:**
- Check internet connection
- Disable ad blockers temporarily
- Try in incognito mode
- Clear browser cache

### Error: "Razorpay API key not configured"

**Solution:**
- Make sure `.env` file exists in project root
- Verify `VITE_RAZORPAY_KEY_ID` is set
- Restart development server after adding keys
- Check for typos in environment variable name

### Payment Modal Not Opening

**Solutions:**
1. Check browser console for errors
2. Verify Razorpay script loaded: `console.log(window.Razorpay)`
3. Ensure popup blockers are disabled
4. Try different browser

---

## Verification Checklist

- [ ] Razorpay account created
- [ ] Test API keys obtained
- [ ] Keys added to `.env` file
- [ ] Development server restarted
- [ ] Checkout page loads without errors
- [ ] Payment button clickable
- [ ] Razorpay modal opens
- [ ] Test payment successful
- [ ] Order created in database
- [ ] Redirected to success page

---

## Next Steps

Once testing is complete:

1. **Complete KYC** on Razorpay dashboard
2. **Get Live Keys** (starts with `rzp_live_`)
3. **Update .env** with live keys for production
4. **Test live payments** with small amounts
5. **Monitor transactions** in Razorpay dashboard

---

## Support

- **Razorpay Docs:** https://razorpay.com/docs
- **Dashboard:** https://dashboard.razorpay.com
- **Support:** support@razorpay.com

---

**Last Updated:** October 7, 2025
