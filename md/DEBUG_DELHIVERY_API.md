# Debug Delhivery API - LOCAL Waybill Issue

## Current Status
- ✅ Edge Function deployed: `delhivery-api`
- ✅ DELHIVERY_API_TOKEN secret is set
- ⚠️ **Issue:** Shipments getting `LOCAL_` waybills instead of real Delhivery waybills

## What `LOCAL_` Waybill Means

A `LOCAL_` waybill (like `LOCAL_1768464126798`) means:
1. ✅ Edge Function is being called successfully
2. ❌ Delhivery API call is failing
3. ⚠️ System is falling back to local waybill generation

## How to Debug

### Step 1: Check Browser Console

When creating a shipment, open browser DevTools (F12) and check the Console tab. Look for:
- `❌ Delhivery API error:` - This will show the actual error
- `📦 Delhivery createShipment response:` - This shows the API response
- `⚠️ Failed to generate waybill from Delhivery:` - This shows waybill generation errors

### Step 2: Common Errors and Solutions

#### Error: "API error: 401 Unauthorized"
**Problem:** Invalid or expired Delhivery API token
**Solution:** 
```powershell
# Update the token
npx supabase@latest secrets set DELHIVERY_API_TOKEN=your-new-token
```

#### Error: "API error: 400 Bad Request"
**Problem:** Invalid request format or missing required fields
**Solution:** Check the shipment data format matches Delhivery API requirements

#### Error: "Edge Function error: ..."
**Problem:** Edge Function encountered an error
**Solution:** Check Edge Function logs in Supabase Dashboard

### Step 3: Check Edge Function Logs

Go to Supabase Dashboard:
1. Navigate to: https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions
2. Click on `delhivery-api`
3. Check the "Logs" tab
4. Look for error messages

### Step 4: Test API Token

Verify your Delhivery API token is valid:
1. Log in to Delhivery Dashboard
2. Check API Credentials section
3. Verify token is active and has correct permissions

## Quick Test

Try generating waybills directly:
1. Go to Admin → Shipping → Waybill Generation tab
2. Enter count: `1`
3. Click "Generate Waybills"
4. Check browser console for errors

If waybill generation works but shipment creation doesn't, the issue is with the shipment creation API endpoint or data format.

## Next Steps

1. **Check browser console** when creating shipment
2. **Share the error message** you see
3. **Check Edge Function logs** in Supabase Dashboard
4. **Verify API token** is correct and active

## Expected Behavior

When working correctly:
- Waybill should start with `DL` (Delhivery waybill)
- Console should show: `✅ Shipment created in Delhivery with waybill: DL...`
- No warning messages about API unavailability
