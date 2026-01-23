# How to Check Edge Function Logs for Pickup API Debugging

## 🔍 Viewing Edge Function Logs

The Edge Function logs contain detailed information about what Delhivery API is returning. Here's how to check them:

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Click on `delhivery-api` function

3. **View Logs**
   - Click on "Logs" tab
   - Look for recent requests (they're timestamped)
   - Find the pickup request logs

4. **What to Look For:**
   ```
   📦 Delhivery API Request: POST https://staging-express.delhivery.com/fm/request/new/
   🔑 Auth Header: Token 8f5d1234567890...
   📝 Request Data: {"pickup_time":"10:00:00","pickup_date":"2024-01-30","warehouse_name":"...","quantity":1}
   ✅ Delhivery API Response Status: 401
   📄 Response Data: {"error":"Unauthorized","message":"..."}
   ❌ Authentication Failed (401)
   ```

### Method 2: Supabase CLI

```powershell
# View recent logs
npx supabase@latest functions logs delhivery-api

# View logs with follow (real-time)
npx supabase@latest functions logs delhivery-api --follow
```

## 📋 What the Logs Will Show

### Successful Request
```
📦 Delhivery API Request: POST https://staging-express.delhivery.com/fm/request/new/
🔑 Auth Header: Token 8f5d1234567890...
📝 Request Data: {"pickup_time":"10:00:00","pickup_date":"2024-01-30","warehouse_name":"Warehouse Name","quantity":1}
✅ Delhivery API Response Status: 200
📄 Response Data: {"pickup_id":"12345","status":"scheduled"}
```

### Failed Request (401)
```
📦 Delhivery API Request: POST https://staging-express.delhivery.com/fm/request/new/
🔑 Auth Header: Token 8f5d1234567890...
📝 Request Data: {"pickup_time":"10:00:00","pickup_date":"2024-01-30","warehouse_name":"Warehouse Name","quantity":1}
✅ Delhivery API Response Status: 401
📄 Response Data: {"error":"Unauthorized","message":"Invalid token or insufficient permissions"}
❌ Authentication Failed (401)
💡 Possible causes:
   1. API token does not have pickup permissions
   2. Token is invalid or expired
   3. Warehouse name does not match
   4. Wrong authentication format
```

## 🔍 Key Information to Check

1. **Auth Header Format**
   - Should be: `Token 8f5d1234567890...`
   - If it shows `Bearer` instead, that's wrong for Express API

2. **Request Data**
   - Verify `warehouse_name` matches exactly with Delhivery dashboard
   - Check `pickup_date` format: YYYY-MM-DD
   - Check `pickup_time` format: HH:MM:SS

3. **Response Status**
   - `200` = Success
   - `401` = Authentication failed
   - `400` = Bad request (invalid data)
   - `403` = Forbidden (no permissions)

4. **Response Data**
   - Look for error messages from Delhivery
   - Check if it mentions specific issues (token, warehouse, etc.)

## 🎯 Next Steps Based on Logs

### If Status is 401:
1. **Check Token Permissions**
   - Contact Delhivery support
   - Verify token has pickup scheduling permissions
   - Request additional permissions if needed

2. **Verify Warehouse Name**
   - Check Delhivery dashboard
   - Ensure exact match (case-sensitive)
   - Copy warehouse name directly from dashboard

3. **Check Token Validity**
   - Verify token is not expired
   - Regenerate token if needed

### If Status is 400:
1. **Check Request Format**
   - Verify all required fields are present
   - Check date/time formats
   - Ensure warehouse name is correct

### If Status is 403:
1. **Check Permissions**
   - Token doesn't have permission for this endpoint
   - Contact Delhivery support

## 📞 Support

If logs show 401 error:
1. Share the log output with Delhivery support
2. Ask them to verify token has pickup permissions
3. Request them to enable pickup scheduling permissions

## 🔗 Related Documentation

- [Delhivery Pickup Scheduling API](https://one.delhivery.com/developer-portal/document/b2c/detail/pickup-scheduling)
- [PICKUP_AUTHENTICATION_TROUBLESHOOTING.md](./PICKUP_AUTHENTICATION_TROUBLESHOOTING.md)
- [DELHIVERY_PICKUP_API_GUIDE.md](./DELHIVERY_PICKUP_API_GUIDE.md)
