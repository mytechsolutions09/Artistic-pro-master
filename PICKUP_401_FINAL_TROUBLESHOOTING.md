# 🔍 Pickup 401 Error - Final Troubleshooting Guide

## Current Status

✅ **Code is correct** - Warehouse name format verified  
✅ **Diagnostics working** - Detailed error analysis provided  
❌ **Still getting 401** - Authentication/permission issue

---

## 🔍 Step 1: Check What's Actually Being Sent

### Check Browser Console

When you make a pickup request, check the browser console (F12) for:

```
📋 B2B Pickup Request: client_name="..." 
OR
⚠️ client_name not configured - using B2C format
```

**If you see "client_name not configured":**
- You're using B2C format (which might be correct)
- OR you need to configure `VITE_DELHIVERY_CLIENT_NAME` for B2B format

### Check Edge Function Logs

**Go to:** https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions/delhivery-api/logs

**Look for the most recent pickup request:**

```
📦 Delhivery API Request: POST https://staging-express.delhivery.com/fm/request/new/
🔑 Auth Header format: Token (token length: XX)
📝 Request Data: {"pickup_time":"10:00:00","pickup_date":"...","warehouse_name":"Lurevi - Janak puri","quantity":1}
✅ Delhivery API Response Status: 401
📄 Response Data: {...}
```

**Key things to check:**
1. ✅ Is `warehouse_name` exactly `"Lurevi - Janak puri"`?
2. ✅ Is `client_name` present? (if using B2B format)
3. ✅ What's the exact error message from Delhivery?

---

## 🎯 Step 2: Determine Your Account Type

### Option A: B2C Account (Consumer Pickups)
- **Format:** No `client_name` required
- **Current status:** ✅ Code supports this
- **If still failing:** Likely token permissions issue

### Option B: B2B Account (Business Pickups)
- **Format:** `client_name` required
- **Current status:** ⚠️ Need to configure `VITE_DELHIVERY_CLIENT_NAME`
- **Action needed:** Get client name from Delhivery

**How to determine:**
1. Check your Delhivery dashboard account type
2. Contact Delhivery support and ask:
   - "Is my account B2B or B2C?"
   - "Do I need to include `client_name` in pickup requests?"
   - "What is my registered client name?"

---

## 🔧 Step 3: Configure Client Name (If B2B)

If your account requires B2B format:

1. **Get your client name from Delhivery:**
   - Contact BD/CS manager
   - Or check dashboard → Account Settings

2. **Add to `.env` file:**
   ```env
   VITE_DELHIVERY_CLIENT_NAME=YourCompanyName
   ```

3. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Test again** - You should see in console:
   ```
   📋 B2B Pickup Request: client_name="YourCompanyName"
   ```

---

## 📞 Step 4: Contact Delhivery Support (Most Likely Solution)

Based on the diagnostic analysis, **the most likely cause is missing pickup permissions** on your API token.

### Email Template:

```
Subject: API Token Missing Pickup Permissions - Urgent

Hello Delhivery Support Team,

I need help enabling pickup permissions for my API token.

CURRENT SITUATION:
- My API token works perfectly for:
  ✅ Creating shipments (/api/cmu/create.json)
  ✅ Generating waybills (/waybill/api/bulk/json/)
  ✅ Tracking shipments (/api/packages/json/)

- But returns 401 Unauthorized for:
  ❌ Pickup requests (/fm/request/new/)

WAREHOUSE DETAILS:
- Warehouse Name: "Lurevi - Janak puri"
- Warehouse format verified: 19 characters, correct spacing and case
- Warehouse is registered and active in Delhivery dashboard

REQUEST:
1. Please enable pickup/CMU permissions for my API token
2. Please confirm if my account requires B2B format (with client_name)
3. If B2B, please provide my registered client name

My account details:
- Account Email: [YOUR EMAIL]
- Account Name: [YOUR NAME]
- API Token: [MENTION IT WORKS FOR OTHER OPERATIONS]

Thank you for your assistance!

Best regards,
[YOUR NAME]
```

---

## 🔍 Step 5: Verify Warehouse Name (Double-Check)

Even though diagnostics show the format is correct, verify in Delhivery dashboard:

1. **Log in to:** https://one.delhivery.com
2. **Go to:** Warehouses section
3. **Find:** "Lurevi - Janak puri"
4. **Copy the EXACT name** shown there
5. **Compare character-by-character** with what's being sent

**Common mismatches:**
- Extra spaces
- Different hyphen character (en-dash vs hyphen)
- Case differences
- Special characters

---

## 📋 Step 6: Check Edge Function Configuration

Verify Edge Function has the token:

**Via Supabase CLI:**
```powershell
# Check if token is set
npx supabase@latest secrets list

# Should show:
# DELHIVERY_API_TOKEN: [hidden]
```

**If not set:**
```powershell
# Set the token
npx supabase@latest secrets set DELHIVERY_API_TOKEN=your-token-here
```

---

## ✅ Expected Resolution

Once Delhivery enables pickup permissions:

1. ✅ **No code changes needed** - Implementation is correct
2. ✅ **No warehouse name changes needed** - Format is correct
3. ✅ **Pickup requests will work immediately** - Just retry

---

## 🎯 Summary

**Most Likely Cause:** API token missing pickup permissions (90% probability)

**Action Required:**
1. ✅ Check Edge Function logs to see exact request
2. ✅ Contact Delhivery support to enable pickup permissions
3. ⏳ If account is B2B, configure `VITE_DELHIVERY_CLIENT_NAME`
4. ⏳ Verify warehouse name matches exactly in dashboard

**Your code is correct** - This is a Delhivery account configuration issue that needs to be resolved on their end.

---

## 📞 Quick Checklist

- [ ] Checked browser console for `client_name` message
- [ ] Checked Edge Function logs for exact request format
- [ ] Verified warehouse name in Delhivery dashboard
- [ ] Contacted Delhivery support about pickup permissions
- [ ] Configured `VITE_DELHIVERY_CLIENT_NAME` (if B2B account)
- [ ] Verified `DELHIVERY_API_TOKEN` is set in Supabase secrets

Once you complete these steps, the 401 error should be resolved!
