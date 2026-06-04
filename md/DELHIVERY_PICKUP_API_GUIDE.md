# Delhivery Pickup Scheduling API Guide

## 📚 Reference Documentation
[Delhivery Pickup Scheduling API Documentation](https://one.delhivery.com/developer-portal/document/b2c/detail/pickup-scheduling)

## 🔍 Current Implementation

### Endpoint
- **URL**: `https://staging-express.delhivery.com/fm/request/new/`
- **Method**: `POST`
- **Authentication**: `Authorization: Token YOUR_TOKEN`

### Request Format
```json
{
  "pickup_time": "10:00:00",
  "pickup_date": "2024-01-30",
  "warehouse_name": "Your Warehouse Name",
  "quantity": 1
}
```

## ⚠️ Common Issues

### 1. Authentication Error (401)
**Symptoms:**
- Error: "Authentication failed"
- Status: 401 Unauthorized

**Possible Causes:**
1. **Token Permissions**: Your API token might not have pickup scheduling permissions
   - ✅ Waybill API works (token is valid)
   - ❌ Pickup API fails (might need additional permissions)
   - **Solution**: Contact Delhivery support to enable pickup permissions

2. **Warehouse Name Mismatch**: The warehouse name must match EXACTLY
   - Case-sensitive
   - Must match what's registered in Delhivery dashboard
   - **Solution**: Verify warehouse name in Delhivery dashboard

3. **Token Format**: Ensure token is set correctly in Supabase secrets
   - Secret name: `DELHIVERY_API_TOKEN`
   - Value: Just the token (no "Token " prefix)
   - Edge Function adds the prefix automatically

### 2. Invalid Request Data (400)
**Symptoms:**
- Error: "Invalid request data"
- Status: 400 Bad Request

**Possible Causes:**
1. Missing required fields
2. Invalid date/time format
3. Warehouse name not found

## 🔧 Troubleshooting Steps

### Step 1: Check Browser Console
After requesting a pickup, check the browser console for:
```
📦 Requesting pickup from Delhivery Express API
🔗 Endpoint: https://staging-express.delhivery.com/fm/request/new/
📋 Payload: { ... }
🔍 Error status: 401
🔍 Error response: { ... }
```

### Step 2: Verify Warehouse Name
1. Log into Delhivery dashboard
2. Go to Warehouses section
3. Copy the EXACT warehouse name (case-sensitive)
4. Ensure it matches what you're sending in the request

### Step 3: Check Token Permissions
1. Contact Delhivery support
2. Verify your API token has pickup scheduling permissions
3. Request additional permissions if needed

### Step 4: Review Edge Function Logs
Check Supabase dashboard → Edge Functions → Logs for:
- The exact request being sent
- The response from Delhivery
- Any error messages

## 📝 Required Fields

According to Delhivery API documentation, the pickup request requires:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pickup_time` | string | Yes | Time in HH:MM:SS format |
| `pickup_date` | string | Yes | Date in YYYY-MM-DD format |
| `warehouse_name` | string | Yes | Exact warehouse name (case-sensitive) |
| `quantity` | number | Yes | Expected number of packages |

## ✅ Verification Checklist

- [ ] API token is set in Supabase Edge Function secrets
- [ ] Token has pickup scheduling permissions
- [ ] Warehouse name matches exactly (case-sensitive) with Delhivery dashboard
- [ ] Date format is YYYY-MM-DD
- [ ] Time format is HH:MM:SS
- [ ] Edge Function is deployed
- [ ] Check browser console for detailed error logs

## 🎯 Next Steps

1. **Check Browser Console** - Look for detailed error logs
2. **Verify Warehouse Name** - Ensure exact match with Delhivery dashboard
3. **Contact Delhivery Support** - Verify token has pickup permissions
4. **Review Edge Function Logs** - See what Delhivery API returns

## 📞 Support

If issues persist:
1. Check [Delhivery API Documentation](https://one.delhivery.com/developer-portal/document/b2c/detail/pickup-scheduling)
2. Contact Delhivery support for API token permissions
3. Review Edge Function logs in Supabase dashboard
