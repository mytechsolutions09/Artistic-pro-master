# ✅ Warehouse Name Fixed - Next Steps

## Current Status

✅ **Warehouse name is now being sent correctly:** `Lurevi - Janak puri`

The placeholder issue has been fixed. The system is now sending the actual warehouse name from your database.

---

## 🔍 If You're Still Getting 401 Errors

Since the warehouse name is correct, the 401 error is most likely due to **API token permissions**.

### Most Likely Cause: API Token Missing Pickup Permissions

Your Delhivery API token (`d69d7c5a886a898e0975c1d4b14d112185b8c17a`) may work for:
- ✅ Waybill generation
- ✅ Shipment creation
- ✅ Tracking
- ❌ **Pickup requests** (requires separate permissions)

---

## 📋 Troubleshooting Steps

### Step 1: Verify Warehouse Name in Delhivery Dashboard

1. **Log in to Delhivery Dashboard:**
   - Go to: https://one.delhivery.com
   - Navigate to: **Warehouses** section

2. **Find your warehouse:**
   - Search for: `Lurevi - Janak puri`
   - Copy the **EXACT** name shown (character-by-character)

3. **Compare:**
   - System name: `Lurevi - Janak puri` (19 characters)
   - Delhivery name: `[Copy from dashboard]`
   - They must match **EXACTLY** (case-sensitive, spaces, hyphens)

### Step 2: Check API Token Permissions

**Contact Delhivery Support** to verify your token has pickup permissions:

**Email Template:**
```
Subject: API Token Pickup Permissions Request

Hello Delhivery Support,

I'm experiencing 401 Unauthorized errors when trying to request pickups via the API.

My API Token: d69d7c5a886a898e0975c1d4b14d112185b8c17a

The token works for:
- Waybill generation ✅
- Shipment creation ✅
- Tracking ✅

But fails for:
- Pickup requests ❌ (401 Unauthorized)

Warehouse Name: Lurevi - Janak puri

Could you please:
1. Verify the token has pickup scheduling permissions
2. Enable pickup permissions if missing
3. Confirm the warehouse name matches your system

Thank you!
```

### Step 3: Verify Token is Set in Supabase

```powershell
# Check if token is set
npx supabase@latest secrets list

# Should show: DELHIVERY_API_TOKEN
```

If not set, run:
```powershell
npx supabase@latest secrets set DELHIVERY_API_TOKEN=d69d7c5a886a898e0975c1d4b14d112185b8c17a
```

### Step 4: Check Edge Function Logs

```powershell
# View recent logs
npx supabase@latest functions logs delhivery-api --tail

# Look for:
# - "🔤 Warehouse name being sent: Lurevi - Janak puri"
# - "✅ Delhivery API Response Status: 401"
# - Any error messages from Delhivery
```

---

## ✅ What's Fixed

1. ✅ Warehouse name placeholder removed
2. ✅ System now uses actual warehouse name from database
3. ✅ Validation added to prevent submitting without warehouse selection
4. ✅ Shipment creation uses active warehouse automatically

---

## 🎯 Expected Behavior Now

When you request a pickup:

1. **Select warehouse** from dropdown: `Lurevi - Janak puri`
2. **System sends:** `warehouse_name: "Lurevi - Janak puri"` ✅
3. **If 401 error:** Check API token permissions (most likely cause)
4. **If 200 success:** Pickup scheduled! 🎉

---

## 📞 Next Actions

1. **If warehouse name matches Delhivery exactly:**
   → Contact Delhivery support to enable pickup permissions

2. **If warehouse name doesn't match:**
   → Update warehouse name in your system or Delhivery dashboard to match exactly

3. **Test again:**
   → Try pickup request after verifying token permissions

---

## 🔒 Security Reminder

Your API token is sensitive. Make sure:
- ✅ Token is set in Supabase Edge Function secrets (not in frontend code)
- ✅ Token is not committed to git
- ✅ Different tokens for staging/production if needed
