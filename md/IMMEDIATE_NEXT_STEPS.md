# 🚨 Immediate Next Steps: Pickup 401 Error

## ✅ What We Know:
- Warehouse name matches exactly: **"Lurevi - Janak puri"** ✅
- Error: **401 Unauthorized** ❌
- **Most likely cause:** API token doesn't have pickup permissions

---

## 🔍 Step 1: Check Edge Function Logs (DO THIS FIRST)

### Via Supabase Dashboard (Recommended):

1. **Open Dashboard:**
   - Go to: https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions

2. **View Logs:**
   - Click on `delhivery-api` function
   - Click **"Logs"** tab at the top
   - Find the **most recent** log entry (should be from your last pickup attempt)

3. **Look for These Lines:**
   ```
   ❌ Authentication Failed (401)
   📄 Delhivery Error Message: [EXACT ERROR FROM DELHIVERY]
   💡 ERROR TYPE: [Token-related OR Warehouse-related]
   🔑 Token Preview: [Shows token is present]
   ⚠️ Warehouse name being sent: "Lurevi - Janak puri"
   ```

4. **What the Error Type Tells You:**
   - **`💡 ERROR TYPE: Token-related`** → Token doesn't have pickup permissions (MOST LIKELY)
   - **`💡 ERROR TYPE: Warehouse-related`** → Double-check warehouse name (even though it seems to match)

---

## 🔑 Step 2: Verify Token Permissions

### Check in Delhivery Dashboard:

1. **Log in:**
   - URL: https://one.delhivery.com
   - Use your Delhivery account credentials

2. **Navigate to API Settings:**
   - Go to: **Settings** → **API Tokens** (or **Developer Portal** → **API Tokens**)
   - Find your API token (the one set in Supabase `DELHIVERY_API_TOKEN` secret)

3. **Check Permissions:**
   - Look for permissions/scopes listed for your token
   - Common names:
     - ✅ `pickup` or `pickup_request` ← **This is what you need**
     - ✅ `cmu` (Customer Management Unit)
     - ✅ `express_api`
     - ✅ `shipment` or `create_shipment`
     - ✅ `waybill` or `generate_waybill`

4. **If Pickup Permissions Are Missing:**
   - Your token works for shipments/waybills but NOT for pickups
   - This is why you're getting 401 error

---

## 📞 Step 3: Contact Delhivery Support

### If Token Doesn't Have Pickup Permissions:

**Email:** support@delhivery.com  
**Subject:** API Token Missing Pickup Permissions

**Message Template:**
```
Hello Delhivery Support,

I'm trying to use the Delhivery API to schedule pickup requests using:
POST https://staging-express.delhivery.com/fm/request/new/

However, I'm getting a 401 Unauthorized error. My API token works fine for:
- Creating shipments
- Generating waybills  
- Tracking shipments

But it fails for pickup requests. 

Could you please:
1. Verify my API token has pickup/CMU permissions enabled
2. If not, enable pickup permissions for my token
3. Or provide guidance on how to generate a new token with pickup permissions

My warehouse is registered in Delhivery with the name: "Lurevi - Janak puri"

Thank you!
```

---

## 🔄 Step 4: Generate New Token (If Needed)

If Delhivery support confirms you need a new token:

1. **Log in to Delhivery Dashboard:**
   - https://one.delhivery.com

2. **Generate New Token:**
   - Go to: **Settings** → **API Tokens** → **Generate New Token**
   - **IMPORTANT:** Select these permissions:
     - ✅ Pickup/CMU permissions
     - ✅ Express API permissions
     - ✅ Shipment creation permissions
     - ✅ Waybill generation permissions

3. **Update Supabase Secret:**
   ```powershell
   npx supabase@latest secrets set DELHIVERY_API_TOKEN=your_new_token_here
   ```

4. **Redeploy Edge Function:**
   ```powershell
   npx supabase@latest functions deploy delhivery-api --no-verify-jwt
   ```

5. **Test Pickup Request Again:**
   - Try scheduling a pickup request
   - Check if 401 error is resolved

---

## 📋 Quick Checklist

- [ ] Checked Edge Function logs for exact error message
- [ ] Verified warehouse name matches exactly in Delhivery dashboard ✅ (Already done)
- [ ] Checked token permissions in Delhivery dashboard
- [ ] Contacted Delhivery support (if permissions missing)
- [ ] Updated token in Supabase secrets (if new token received)
- [ ] Redeployed Edge Function (if token updated)
- [ ] Tested pickup request again

---

## 🎯 Most Likely Solution

**90% chance:** Your API token doesn't have pickup permissions.

**Solution:** Contact Delhivery support to enable pickup permissions for your token.

**After they enable it:** Try pickup request again - should work immediately.

---

## 📚 Related Guides

- [Token Permissions Guide](./PICKUP_401_TOKEN_PERMISSIONS_GUIDE.md) - Detailed guide
- [Pickup API Guide](./DELHIVERY_PICKUP_API_GUIDE.md) - API reference
- [Troubleshooting Guide](./PICKUP_401_TROUBLESHOOTING.md) - Common issues

---

## 🆘 Still Need Help?

If you've tried everything and still getting 401:

1. **Share Edge Function Logs:**
   - Copy the full log entry from the most recent pickup request
   - Include: `📄 Delhivery Error Message:` and `💡 ERROR TYPE:`

2. **Share Token Info (safely):**
   - Token length (not the actual token)
   - When token was generated
   - What permissions it has (from Delhivery dashboard)

3. **Share Warehouse Info:**
   - Exact warehouse name from Delhivery dashboard
   - Warehouse status (active/inactive)
   - Warehouse ID (if available)
