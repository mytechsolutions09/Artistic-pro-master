# Pickup 401 Error: Token Permissions Guide

## ✅ Warehouse Name Verified
You've confirmed the warehouse name matches exactly: **"Lurevi - Janak puri"**

Since the name matches, the 401 error is **most likely due to API token permissions**.

---

## 🔍 Step 1: Check Edge Function Logs for Exact Error

The Edge Function logs will show Delhivery's exact error message, which will help identify the issue.

### How to Check Logs:

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions
   - Or navigate: Dashboard → Edge Functions → `delhivery-api`

2. **Open Logs Tab:**
   - Click on `delhivery-api` function
   - Click the **"Logs"** tab at the top

3. **Find Recent Pickup Request:**
   - Look for the most recent log entry (should be from your last pickup attempt)
   - Look for these key lines:
     - `❌ Authentication Failed (401)`
     - `📄 Delhivery Error Message:` ← **This is the most important**
     - `💡 ERROR TYPE:` ← Will tell you if it's token-related or warehouse-related
     - `🔑 Token Preview:` ← Confirms token is present

4. **What to Look For:**
   - If you see: `💡 ERROR TYPE: Token-related`
     - → Token doesn't have pickup permissions
     - → Token might be expired
     - → Contact Delhivery support
   
   - If you see: `💡 ERROR TYPE: Warehouse-related`
     - → Double-check warehouse name (even though it seems to match)
     - → Verify warehouse is active in Delhivery dashboard

---

## 🔑 Step 2: Verify Token Permissions

Your Delhivery API token may work for some operations but not others.

### Token Permissions Checklist:

✅ **Works (probably):**
- Creating shipments (`/api/cmu/create.json`)
- Generating waybills (`/waybill/api/bulk/json/`)
- Tracking shipments (`/api/packages/json/`)

❌ **Doesn't Work (401 error):**
- Pickup requests (`/fm/request/new/`) ← **This is what's failing**

### How to Check Token Permissions:

1. **Log in to Delhivery Dashboard:**
   - URL: https://one.delhivery.com
   - Use your Delhivery account credentials

2. **Navigate to API Settings:**
   - Go to: **Settings** → **API Tokens** (or **Developer Portal**)
   - Find your API token (the one set in `DELHIVERY_API_TOKEN` secret)

3. **Check Permissions:**
   - Look for permissions/scopes listed for your token
   - Common permission names:
     - `pickup` or `pickup_request`
     - `cmu` (Customer Management Unit)
     - `express_api`
     - `ltl_api`

4. **If Pickup Permissions Are Missing:**
   - Your token doesn't have pickup permissions enabled
   - You need to either:
     - **Option A:** Enable pickup permissions (if available in dashboard)
     - **Option B:** Generate a new token with pickup permissions
     - **Option C:** Contact Delhivery support to enable pickup permissions

---

## 📞 Step 3: Contact Delhivery Support

If your token doesn't have pickup permissions, contact Delhivery support.

### What to Tell Them:

**Subject:** API Token Missing Pickup Permissions

**Message:**
```
Hello,

I'm trying to use the Delhivery API to schedule pickup requests using the endpoint:
POST https://staging-express.delhivery.com/fm/request/new/

However, I'm getting a 401 Unauthorized error. My API token works fine for:
- Creating shipments
- Generating waybills
- Tracking shipments

But it fails for pickup requests. Could you please:
1. Verify my API token has pickup/CMU permissions enabled
2. If not, enable pickup permissions for my token
3. Or provide guidance on how to generate a new token with pickup permissions

My warehouse is registered in Delhivery with the name: "Lurevi - Janak puri"

Thank you!
```

### Delhivery Support Channels:
- **Email:** support@delhivery.com
- **Phone:** Check Delhivery dashboard for support number
- **Dashboard:** Some accounts have a support chat/widget

---

## 🔄 Step 4: Generate New Token (If Needed)

If Delhivery support confirms you need a new token:

1. **Log in to Delhivery Dashboard:**
   - https://one.delhivery.com

2. **Generate New Token:**
   - Go to: **Settings** → **API Tokens** → **Generate New Token**
   - **IMPORTANT:** Select permissions/scopes:
     - ✅ Pickup/CMU permissions
     - ✅ Express API permissions
     - ✅ Shipment creation permissions
     - ✅ Waybill generation permissions

3. **Update Supabase Secret:**
   ```bash
   npx supabase@latest secrets set DELHIVERY_API_TOKEN=your_new_token_here
   ```

4. **Redeploy Edge Function (if needed):**
   ```bash
   npx supabase@latest functions deploy delhivery-api --no-verify-jwt
   ```

5. **Test Pickup Request Again:**
   - Try scheduling a pickup request
   - Check if 401 error is resolved

---

## 🧪 Step 5: Test Token Directly (Optional)

You can test if your token works for pickup requests by calling the API directly.

### Using cURL:
```bash
curl -X POST "https://staging-express.delhivery.com/fm/request/new/" \
  -H "Authorization: Token YOUR_API_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_time": "12:00:00",
    "pickup_date": "2026-01-16",
    "warehouse_name": "Lurevi - Janak puri",
    "quantity": 1
  }'
```

### What to Expect:
- **200 OK:** Token has pickup permissions ✅
- **401 Unauthorized:** Token doesn't have pickup permissions ❌
- **400 Bad Request:** Request format issue (check warehouse name)

---

## 📋 Summary Checklist

- [ ] Checked Edge Function logs for exact error message
- [ ] Verified warehouse name matches exactly in Delhivery dashboard
- [ ] Checked token permissions in Delhivery dashboard
- [ ] Contacted Delhivery support (if permissions missing)
- [ ] Updated token in Supabase secrets (if new token received)
- [ ] Redeployed Edge Function (if token updated)
- [ ] Tested pickup request again

---

## 💡 Common Solutions

### Solution 1: Token Permissions
**Problem:** Token doesn't have pickup permissions  
**Fix:** Contact Delhivery support to enable pickup permissions

### Solution 2: Token Expired
**Problem:** Token is expired or invalid  
**Fix:** Generate new token in Delhivery dashboard and update Supabase secret

### Solution 3: Wrong Token Type
**Problem:** Using Express API token for LTL API (or vice versa)  
**Fix:** Use correct token type for the endpoint (Express API uses `Token` prefix)

### Solution 4: Warehouse Not Active
**Problem:** Warehouse exists but is inactive in Delhivery  
**Fix:** Activate warehouse in Delhivery dashboard

---

## 🆘 Still Having Issues?

If you've tried all the above and still getting 401 errors:

1. **Share Edge Function Logs:**
   - Copy the full log entry from the most recent pickup request
   - Include: `📄 Delhivery Error Message:` and `💡 ERROR TYPE:`

2. **Share Token Info (safely):**
   - Token length (not the actual token)
   - Token type (Express API, LTL API, etc.)
   - When token was generated

3. **Share Warehouse Info:**
   - Exact warehouse name from Delhivery dashboard
   - Warehouse status (active/inactive)
   - Warehouse ID (if available)

---

## 📚 Related Documentation

- [Delhivery Pickup API Guide](./DELHIVERY_PICKUP_API_GUIDE.md)
- [Pickup 401 Troubleshooting](./PICKUP_401_TROUBLESHOOTING.md)
- [Warehouse Registration Guide](./WAREHOUSE_REGISTRATION_REQUIRED.md)
- [Edge Function Deployment](./DEPLOY_DELHIVERY_EDGE_FUNCTION.md)
