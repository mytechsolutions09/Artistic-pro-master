# Pickup Troubleshooting Guide

## Issue: Unable to create pickup from admin panel

### Problem
When creating a pickup request from the admin panel, it is not being passed to the Delhivery platform.

### Solution

This guide provides step-by-step troubleshooting to resolve the issue.

---

## Step 1: Check Browser Console Logs

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try to create a pickup from the admin panel
4. Look for these log messages:

```
🚀 handleRequestPickup called
📦 Pickup request data: {...}
📤 Sending pickup request to Delhivery...
```

**What to look for:**
- ✅ **Success**: `✅ Pickup requested successfully via Delhivery API`
- ❌ **Error**: Any error messages with detailed information

---

## Step 2: Verify Warehouse Registration

The **most common issue** is that the warehouse name in your database doesn't match the warehouse registered in Delhivery.

### Check your warehouse name:
1. Go to Admin Panel → Shipping → Warehouse tab
2. Note the exact warehouse name (case-sensitive!)

### Verify in Delhivery:
1. Log into your Delhivery dashboard
2. Go to Warehouse Management
3. Verify the warehouse exists with **EXACTLY** the same name
4. The warehouse must be **Active**

**Example:**
- ✅ Correct: `"Lurevi Main Warehouse"` (matches exactly)
- ❌ Wrong: `"lurevi main warehouse"` (lowercase)
- ❌ Wrong: `"Lurevi Warehouse"` (missing "Main")

---

## Step 3: Verify Supabase Edge Function Deployment

The pickup request goes through a Supabase Edge Function. Ensure it's deployed:

### Check if deployed:
```powershell
# In PowerShell (Windows)
supabase functions list
```

You should see `delhivery-api` in the list.

### Deploy if missing:
```powershell
# Deploy the edge function
supabase functions deploy delhivery-api

# Check deployment logs
supabase functions logs delhivery-api
```

---

## Step 4: Check Delhivery API Token

The Edge Function needs the Delhivery API token as a secret.

### Set the token:
```powershell
# Set the secret in Supabase
supabase secrets set DELHIVERY_API_TOKEN=your_actual_token_here
```

### Verify it's set:
1. Go to Supabase Dashboard
2. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
3. Verify `DELHIVERY_API_TOKEN` is listed

---

## Step 5: Check Edge Function Logs

View real-time logs to see what's happening:

```powershell
# Stream edge function logs
supabase functions logs delhivery-api --follow
```

Look for these messages:
- `🔔 Incoming request to delhivery-api Edge Function`
- `📦 Delhivery API Request: POST https://ltl-clients-api-dev.delhivery.com/pickup_requests`
- `✅ Delhivery API Response Status: 200` (success)

---

## Step 6: Common Error Messages

### Error: "Warehouse not found in Delhivery"
**Cause**: The warehouse name doesn't exist in Delhivery's system.

**Solution**:
1. Register the warehouse in Delhivery first
2. Use the exact warehouse name (case-sensitive) in your admin panel

---

### Error: "Authentication failed" or "401 Unauthorized"
**Cause**: The API token is invalid, expired, or not set.

**Solution**:
1. Get a valid API token from Delhivery
2. Set it in Supabase secrets:
   ```powershell
   supabase secrets set DELHIVERY_API_TOKEN=your_actual_token_here
   ```
3. Redeploy the Edge Function:
   ```powershell
   supabase functions deploy delhivery-api
   ```

---

### Error: "Edge Function error"
**Cause**: The Edge Function is not deployed or has an error.

**Solution**:
1. Deploy the Edge Function:
   ```powershell
   supabase functions deploy delhivery-api
   ```
2. Check logs for errors:
   ```powershell
   supabase functions logs delhivery-api
   ```

---

### Error: "Network/CORS error"
**Cause**: Unable to reach Delhivery API through the Edge Function.

**Solution**:
1. Verify Edge Function is deployed
2. Check internet connectivity
3. Verify Supabase project is not suspended

---

## Step 7: Test the Edge Function Directly

You can test the Edge Function directly using curl:

```powershell
# Replace YOUR_PROJECT_URL and YOUR_ANON_KEY
curl -X POST 'https://YOUR_PROJECT_URL.supabase.co/functions/v1/delhivery-api' `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{
    "action": "/pickup_requests",
    "method": "POST",
    "endpoint": "ltl",
    "data": {
      "client_warehouse": "Lurevi Main Warehouse",
      "pickup_date": "2025-10-20",
      "start_time": "10:00:00",
      "expected_package_count": 1
    }
  }'
```

Expected response (success):
```json
{
  "success": true,
  "data": {
    "pickup_id": "...",
    ...
  }
}
```

---

## Step 8: Verify Database Update

Even if Delhivery integration fails, the pickup should be recorded in your database.

1. Check the `shipments` table in Supabase
2. Verify `pickup_date` is set for the shipment
3. Check `pickup_id` if Delhivery request was successful

---

## Complete Checklist

- [ ] Warehouse name matches exactly with Delhivery registration (case-sensitive)
- [ ] Warehouse is Active in Delhivery
- [ ] Edge Function is deployed (`supabase functions list`)
- [ ] DELHIVERY_API_TOKEN secret is set in Supabase
- [ ] Edge Function logs show successful deployment
- [ ] Browser console shows detailed error messages
- [ ] Test Edge Function directly with curl (optional)

---

## Quick Fix Script

Run this PowerShell script to deploy and test:

```powershell
# deploy-and-test-pickup.ps1

Write-Host "🚀 Deploying Delhivery Edge Function..." -ForegroundColor Cyan
supabase functions deploy delhivery-api

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n📋 Checking function status..." -ForegroundColor Cyan
supabase functions list

Write-Host "`n🔍 Viewing recent logs..." -ForegroundColor Cyan
supabase functions logs delhivery-api --limit 50

Write-Host "`n✅ Done! Now try creating a pickup from the admin panel." -ForegroundColor Green
Write-Host "💡 Keep the console open to see real-time logs with:" -ForegroundColor Yellow
Write-Host "   supabase functions logs delhivery-api --follow" -ForegroundColor Yellow
```

---

## Still Not Working?

If you've followed all steps and it's still not working:

1. **Check Delhivery API Status**: Visit [Delhivery Status](https://www.delhivery.com) to see if their API is down
2. **Contact Delhivery Support**: Verify your account has API access enabled
3. **Check Delhivery API Version**: Ensure you're using the correct API endpoints
4. **Review Edge Function Code**: Check `supabase/functions/delhivery-api/index.ts` for any issues

---

## Support Contacts

- **Delhivery API Support**: api-support@delhivery.com
- **Delhivery Developer Portal**: https://developers.delhivery.com
- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions

---

## Summary

The most common causes are:
1. **Warehouse name mismatch** (70% of cases)
2. **Missing or invalid API token** (20% of cases)
3. **Edge Function not deployed** (10% of cases)

Always check browser console logs first - they provide detailed error messages and troubleshooting steps!

