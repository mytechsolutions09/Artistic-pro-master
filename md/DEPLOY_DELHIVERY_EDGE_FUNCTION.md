# Deploy Delhivery Edge Function - Quick Guide

## ✅ Step 1: Edge Function Deployed
The Edge Function has been successfully deployed!

## ⚠️ Step 2: Set Delhivery API Token Secret

You need to set your Delhivery API token as a secret in Supabase. Run this command:

```powershell
npx supabase@latest secrets set DELHIVERY_API_TOKEN=your-actual-delhivery-token
```

**Replace `your-actual-delhivery-token` with your actual token from Delhivery Dashboard.**

### How to Get Your Delhivery API Token:
1. Log in to your Delhivery Dashboard: https://delhivery.com/
2. Go to **Settings** → **API Credentials**
3. Copy your API Token
4. Use it in the command above

## Step 3: Verify Deployment

Check if the function is working:

```powershell
# List all functions
npx supabase@latest functions list

# Check logs
npx supabase@latest functions logs delhivery-api --tail
```

## Step 4: Test in Your App

1. Go to Admin → Shipping
2. Create a new shipment
3. Check the browser console - you should see real waybills (starting with `DL`) instead of `MOCK...`

## Troubleshooting

### If you still see mock waybills:

1. **Check if secret is set:**
   ```powershell
   npx supabase@latest secrets list
   ```

2. **Check Edge Function logs:**
   ```powershell
   npx supabase@latest functions logs delhivery-api --tail
   ```

3. **Verify token is correct:**
   - Make sure there are no extra spaces in the token
   - Token should be a long alphanumeric string

4. **Redeploy if needed:**
   ```powershell
   npx supabase@latest functions deploy delhivery-api --no-verify-jwt
   ```

## Current Status

- ✅ Edge Function deployed: `delhivery-api`
- ⚠️ **Action Required:** Set `DELHIVERY_API_TOKEN` secret
- ⏳ Waiting for token configuration

Once you set the token, shipments will use real Delhivery waybills!
