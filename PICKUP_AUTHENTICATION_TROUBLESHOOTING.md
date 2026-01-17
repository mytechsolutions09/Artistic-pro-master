# Pickup API Authentication Troubleshooting Guide

## Issue
Getting "Authentication failed" error when requesting pickup from Delhivery API.

## Possible Causes

### 1. **Token Permissions**
The Delhivery API token might not have permissions for pickup requests. Even though waybill generation works, pickup API might require additional permissions.

**Solution:**
- Contact Delhivery support to verify your API token has pickup permissions
- Check if your token is for staging vs production environment

### 2. **Different Authentication Format**
The pickup API (`/fm/request/new/`) might require a different authentication format than the waybill API.

**Current Setup:**
- Waybill API uses: `track.delhivery.com` with `Token <token>` format ✅ (Working)
- Pickup API uses: `staging-express.delhivery.com` with `Token <token>` format ❌ (Failing)

**Solution:**
- Verify the correct authentication format for pickup API with Delhivery documentation
- Check if pickup API requires Bearer token instead of Token format

### 3. **Warehouse Name Mismatch**
The warehouse name might not match exactly what's registered in Delhivery.

**Solution:**
- Verify the warehouse name matches exactly (case-sensitive) in Delhivery dashboard
- Check if warehouse is registered and active in Delhivery

### 4. **Token Expired or Invalid**
The token might be expired or invalid for the pickup endpoint specifically.

**Solution:**
- Verify token is still valid
- Check if token needs to be regenerated

## Debugging Steps

### Step 1: Check Browser Console
After requesting a pickup, check the browser console for detailed error logs:
- Look for `🔍 Error status:` - shows the HTTP status code
- Look for `🔍 Error response:` - shows the full Delhivery API response
- Look for `📄 Full response data:` - shows detailed error information

### Step 2: Check Edge Function Logs
View the Edge Function logs to see what Delhivery API is returning:

```powershell
# View recent logs (check Supabase dashboard or use CLI)
# The logs will show:
# - The exact request being sent
# - The response status code
# - The error message from Delhivery
```

### Step 3: Verify Token is Set
Ensure the token is set in Supabase Edge Function secrets:

```powershell
# Check if token is set (you'll need to verify in Supabase dashboard)
# Go to: Supabase Dashboard > Edge Functions > Secrets
# Verify DELHIVERY_API_TOKEN is set correctly
```

### Step 4: Test with Different Endpoint
Try using a different endpoint format if available:

- Current: `/fm/request/new/` on `staging-express.delhivery.com`
- Alternative: Check Delhivery documentation for other pickup endpoints

## Quick Fixes to Try

### Fix 1: Verify Warehouse Name
1. Go to Delhivery dashboard
2. Check the exact warehouse name (case-sensitive)
3. Ensure it matches exactly what you're sending in the pickup request

### Fix 2: Check API Token Permissions
1. Contact Delhivery support
2. Verify your API token has pickup request permissions
3. Request additional permissions if needed

### Fix 3: Try Production Endpoint
If you're using staging, try production endpoint (if you have access):

```typescript
// In DelhiveryService.ts, try changing endpoint from 'main' to production
// Note: This requires production API token
```

## Next Steps

1. **Check Browser Console** - Look for detailed error logs with status code and response
2. **Verify Token Permissions** - Contact Delhivery to confirm pickup permissions
3. **Check Warehouse Name** - Ensure exact match with Delhivery dashboard
4. **Review Edge Function Logs** - See what Delhivery API is actually returning

## Expected Behavior

When working correctly, you should see:
- ✅ Pickup request successful
- ✅ Pickup ID returned from Delhivery
- ✅ No authentication errors

## Current Status

- ✅ Waybill API: Working (uses `track` endpoint)
- ❌ Pickup API: Authentication failed (uses `main` endpoint)

This suggests the token works for waybill API but might not have permissions for pickup API, or the pickup API requires different authentication.
