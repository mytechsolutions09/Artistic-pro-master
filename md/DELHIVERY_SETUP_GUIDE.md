# Delhivery API Setup Guide

## 🚨 Current Issue
You're seeing: **"Delhivery API not configured. Using mock data for testing."**

This means the system is using mock/fake data instead of real Delhivery shipping data.

## ✅ Solution: Configure Your Delhivery API Token

### Step 1: Get Your Delhivery API Token

1. **Login to Delhivery Dashboard**
   - Go to: https://account.delhivery.com/
   - Login with your credentials

2. **Navigate to API Settings**
   - Click on **"Settings"** or **"API"** in the menu
   - Look for **"API Token"** or **"API Key"**

3. **Copy Your API Token**
   - Copy the token (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - Keep it secure - don't share it publicly!

### Step 2: Create .env File

1. **Copy the template file:**
   ```bash
   copy env.template .env
   ```
   (On Mac/Linux: `cp env.template .env`)

2. **Open `.env` file in your editor**

3. **Find the Delhivery section** (around line 140):
   ```env
   # ===========================================
   # DELHIVERY API CONFIGURATION
   # ===========================================
   # Delhivery API Token (Get from Delhivery Dashboard)
   VITE_DELHIVERY_API_TOKEN=your-delhivery-api-token
   ```

4. **Replace with your actual token:**
   ```env
   VITE_DELHIVERY_API_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

### Step 3: Configure API URLs

#### For Testing (Staging Environment):
```env
VITE_DELHIVERY_BASE_URL=https://staging-express.delhivery.com
VITE_DELHIVERY_EXPRESS_URL=https://express-dev-test.delhivery.com
VITE_DELHIVERY_TRACK_URL=https://track.delhivery.com
```

#### For Production (Live Environment):
```env
VITE_DELHIVERY_BASE_URL=https://express.delhivery.com
VITE_DELHIVERY_EXPRESS_URL=https://express.delhivery.com
VITE_DELHIVERY_TRACK_URL=https://track.delhivery.com
```

### Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 Complete .env Example

Here's what your Delhivery configuration should look like:

```env
# ===========================================
# DELHIVERY API CONFIGURATION
# ===========================================
# Delhivery API Token (Get from Delhivery Dashboard)
VITE_DELHIVERY_API_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Delhivery API URLs
# Staging URLs (for testing)
VITE_DELHIVERY_BASE_URL=https://staging-express.delhivery.com
VITE_DELHIVERY_EXPRESS_URL=https://express-dev-test.delhivery.com
VITE_DELHIVERY_TRACK_URL=https://track.delhivery.com

# Delhivery API Settings
VITE_DELHIVERY_TIMEOUT=10000
VITE_DELHIVERY_RETRY_ATTEMPTS=3
```

## 🧪 Testing Your Configuration

After setting up, test if it's working:

1. **Go to Admin Panel:**
   - Navigate to `/admin/shipping`

2. **Try Pin Code Check:**
   - Go to "Pin Code Check" tab
   - Enter a pin code (e.g., 110001 for Delhi)
   - If configured correctly, you'll see real serviceability data

3. **Check Console:**
   - Open browser console (F12)
   - You should NOT see "Using mock data" messages anymore
   - You should see actual API responses

## 🔐 Security Notes

1. **Never commit `.env` file to git**
   - It's already in `.gitignore`
   - Keep your API token secret

2. **Use different tokens for staging/production**
   - Staging token for testing
   - Production token for live site

3. **Rotate tokens periodically**
   - Change your API token every few months
   - Update `.env` file when changed

## 🚀 Production Deployment

### For Netlify:
1. Go to Site Settings → Environment Variables
2. Add:
   - `VITE_DELHIVERY_API_TOKEN` = your-production-token
   - `VITE_DELHIVERY_BASE_URL` = https://express.delhivery.com
   - `VITE_DELHIVERY_EXPRESS_URL` = https://express.delhivery.com
   - `VITE_DELHIVERY_TRACK_URL` = https://track.delhivery.com

### For Vercel:
1. Go to Project Settings → Environment Variables
2. Add the same variables as above

## ❓ Troubleshooting

### Still seeing "Using mock data"?
1. ✅ Check `.env` file exists in project root
2. ✅ Verify token is correct (no spaces, quotes)
3. ✅ Restart dev server
4. ✅ Clear browser cache

### API errors?
1. ✅ Verify token is valid in Delhivery dashboard
2. ✅ Check your Delhivery account is active
3. ✅ Ensure you have API access enabled
4. ✅ Try with staging URLs first

### CORS errors?
- The system uses Supabase Edge Functions to avoid CORS
- Make sure your Supabase is properly configured
- See `DELHIVERY_CORS_FIX_GUIDE.md` for details

## 📞 Need Help?

1. **Delhivery Support:**
   - Email: support@delhivery.com
   - Phone: +91-124-4642896

2. **Documentation:**
   - API Docs: https://docs.delhivery.com/
   - Developer Portal: https://developer.delhivery.com/

## ✅ Checklist

- [ ] Created `.env` file from `env.template`
- [ ] Got API token from Delhivery dashboard
- [ ] Added token to `.env` file
- [ ] Configured API URLs (staging or production)
- [ ] Restarted development server
- [ ] Tested pin code check in admin panel
- [ ] Verified no "mock data" messages in console

---

**Once configured, you'll have access to:**
- ✅ Real-time shipping rates
- ✅ Actual delivery time estimates
- ✅ Live shipment tracking
- ✅ Waybill generation
- ✅ Pickup scheduling
- ✅ Pin code serviceability checks

