# 🔍 Debug Pickup Issue

## Current Status
- ✅ Edge Function is deployed
- ✅ DELHIVERY_API_TOKEN secret is set
- ❌ Getting "Edge Function error" when creating pickup

## What This Means

The error message "Edge Function error" is a catch-all error from our code when:
1. The Edge Function is called successfully
2. But either:
   - The Edge Function can't parse the response from Delhivery
   - Delhivery API returns an error
   - Network issue connecting to Delhivery

## Next Steps to Debug

### Method 1: Check Supabase Dashboard Logs

1. Go to: https://supabase.com/dashboard/project/varduayfdqivaofymfov/logs/edge-functions
2. Click on "Edge Functions" logs
3. Filter by: `delhivery-api`
4. Look for recent error logs

You should see:
- `🔔 Incoming request to delhivery-api Edge Function`
- `📦 Delhivery API Request: POST https://ltl-clients-api-dev.delhivery.com/pickup_requests`
- `✅ Delhivery API Response Status: XXX`
- Any error messages

### Method 2: Test Directly in Browser Console

1. Copy the contents of `test-pickup-direct.js`
2. Open browser console (F12) on your admin page
3. Update line with your warehouse name:
   ```javascript
   client_warehouse: 'YOUR_ACTUAL_WAREHOUSE_NAME', // Replace this!
   ```
4. Paste the script in console
5. Run: `testPickupDirect()`
6. Check the output for detailed errors

### Method 3: Check Warehouse Name

**Most Common Issue (70% of cases):**

The warehouse name must match EXACTLY (case-sensitive) with Delhivery:

1. **Check your database warehouse name:**
   - Go to: Admin Panel → Shipping → Warehouse tab
   - Note the exact name (example: "Lurevi Main Warehouse")

2. **Check Delhivery dashboard:**
   - Log into: https://delhivery.com (or your Delhivery portal)
   - Go to: Warehouse Management / Settings
   - Find your warehouse name
   - **IT MUST MATCH EXACTLY!**

**Examples:**
- ❌ Database: "lurevi main warehouse" | Delhivery: "Lurevi Main Warehouse" → MISMATCH!
- ❌ Database: "Lurevi Warehouse" | Delhivery: "Lurevi Main Warehouse" → MISMATCH!
- ✅ Database: "Lurevi Main Warehouse" | Delhivery: "Lurevi Main Warehouse" → MATCH!

## Common Errors and Solutions

### Error 1: Warehouse Not Found (400/404)
**Symptom**: Response status 400 or 404 from Delhivery
**Cause**: Warehouse name doesn't exist in Delhivery
**Solution**: 
- Verify exact warehouse name in Delhivery dashboard
- Update database to match, OR
- Register warehouse in Delhivery with database name

### Error 2: Unauthorized (401)
**Symptom**: Response status 401
**Cause**: Invalid API token or wrong auth format
**Solution**:
- For LTL API, auth should be: `Bearer YOUR_TOKEN`
- Check if you're using the correct token for LTL API (not Express API)
- Verify token is valid in Delhivery dashboard

### Error 3: Forbidden (403)
**Symptom**: Response status 403
**Cause**: Token doesn't have permission for pickup creation
**Solution**:
- Contact Delhivery support to enable pickup API access
- Verify you're using the correct API environment (dev vs prod)

### Error 4: Bad Request (400)
**Symptom**: Response status 400 with validation errors
**Cause**: Invalid request data format
**Solution**:
- Check date format: should be YYYY-MM-DD
- Check time format: should be HH:MM:SS
- Ensure expected_package_count is a number

## Quick Diagnostic Commands

```powershell
# 1. Check if Edge Function is deployed
npx supabase@latest functions list

# 2. Check secrets are set
npx supabase@latest secrets list

# 3. Redeploy Edge Function (if needed)
npx supabase@latest functions deploy delhivery-api --no-verify-jwt
```

## Browser Console Debugging

Open browser console (F12) and look for these messages when you click "Request Pickup":

**Request sent:**
```
🚀 handleRequestPickup called
📦 Pickup request data: {...}
📤 Sending pickup request to Delhivery...
```

**What you need to see in the response:**
Look at the `result` object in the notification or console. It should show:
- `status`: HTTP status code (200, 400, 401, etc.)
- `statusText`: Status message
- `data`: Response from Delhivery with actual error details

## Action Items

Based on error type:

**If you see status 400-499:**
→ It's a client error (warehouse name, data format, auth)
→ Check warehouse name first!

**If you see status 500-599:**
→ It's a server error (Delhivery API issue)
→ Check Delhivery API status
→ Contact Delhivery support

**If you see network error:**
→ Edge Function can't reach Delhivery
→ Check if Delhivery API is up
→ Verify endpoint URL is correct

## Expected Successful Response

When it works, you should see:
```json
{
  "success": true,
  "data": {
    "pickup_id": "PICKUP12345",
    "status": "scheduled",
    "pickup_date": "2025-10-25",
    "warehouse": "Your Warehouse Name"
  }
}
```

## Still Stuck?

1. Check Supabase Dashboard logs (Method 1 above)
2. Run the direct test (Method 2 above)
3. Share the exact error response you see
4. Check warehouse name matches exactly (Method 3 above)

---

**Dashboard Logs**: https://supabase.com/dashboard/project/varduayfdqivaofymfov/logs/edge-functions

