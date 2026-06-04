# Pickup Request 401 Error - Troubleshooting Guide

## 🔍 Current Issue
Getting `401 Unauthorized` error when requesting pickup, even after manually registering warehouse in Delhivery dashboard.

## ✅ Steps to Resolve

### Step 1: Check Edge Function Logs

The Edge Function logs will show exactly what's being sent to Delhivery:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions
   - Click on `delhivery-api`
   - Click **"Logs"** tab

2. **Look for these details in the logs:**
   - `📦 Request Data:` - Check the warehouse name being sent
   - `🔑 Token preview:` - Verify token is present
   - `✅ Delhivery API Response Status: 401`
   - `📄 Response Data:` - See exact error from Delhivery

### Step 2: Verify Warehouse Name Match

**CRITICAL:** The warehouse name must match **EXACTLY** (case-sensitive, spaces, hyphens):

1. **In Delhivery Dashboard:**
   - Log in to https://one.delhivery.com
   - Go to **Warehouses** section
   - Find your warehouse
   - Copy the **exact name** (including spaces, capitalization, hyphens)

2. **In Your System:**
   - Go to **Shipping → Warehouse** tab
   - Find "Lurevi - Janak puri"
   - Compare character-by-character with Delhivery

3. **Common Mismatches:**
   - `Lurevi - Janak puri` vs `Lurevi - Janak Puri` (capital P)
   - `Lurevi - Janak puri` vs `Lurevi-Janak puri` (space before hyphen)
   - `Lurevi - Janak puri` vs `Lurevi - Janakpuri` (space in "Janak puri")

### Step 3: Verify API Token Permissions

Your API token might not have pickup permissions:

1. **Check Token Permissions:**
   - Log in to Delhivery dashboard
   - Go to **Settings → API Tokens**
   - Verify your token has **pickup/CMU permissions**

2. **If Token Doesn't Have Permissions:**
   - Contact Delhivery support to enable pickup permissions
   - Or generate a new token with pickup permissions

### Step 4: Verify Token is Valid

1. **Check Token in Supabase:**
   ```bash
   npx supabase@latest secrets list
   ```
   - Verify `DELHIVERY_API_TOKEN` is set
   - Check it's not expired

2. **Test Token Directly:**
   - Try creating a shipment (should work if token is valid)
   - If shipment creation works but pickup doesn't, it's a permissions issue

### Step 5: Check Warehouse Status in Delhivery

1. **Verify Warehouse is Active:**
   - In Delhivery dashboard, check warehouse status
   - Ensure it's **Active** (not inactive/suspended)

2. **Wait for Propagation:**
   - After registering warehouse, wait 5-10 minutes
   - Delhivery may need time to propagate the registration

## 🔧 Quick Fixes

### Fix 1: Update Warehouse Name to Match Exactly

If names don't match:

1. **Option A:** Edit warehouse in your system to match Delhivery exactly
   - Go to **Shipping → Warehouse** tab
   - Click **Edit** on the warehouse
   - Update name to match Delhivery exactly
   - Save

2. **Option B:** Update warehouse name in Delhivery to match your system
   - Log in to Delhivery dashboard
   - Edit warehouse name to match your system exactly

### Fix 2: Check Edge Function Logs for Exact Error

The Edge Function logs will show:
- Exact warehouse name being sent
- Exact error message from Delhivery
- Token format being used

**Look for these log entries:**
```
📝 Request Data: {"warehouse_name":"Lurevi - Janak puri",...}
✅ Delhivery API Response Status: 401
📄 Response Data: {"error":"...","message":"..."}
```

## 📋 What to Check in Edge Function Logs

When you check the logs, look for:

1. **Request Payload:**
   ```
   📝 Request Data: {"pickup_time":"12:00:00","pickup_date":"2026-01-16","warehouse_name":"Lurevi - Janak puri","quantity":1}
   ```

2. **Response Error:**
   ```
   📄 Response Data: {"raw":"There has been an error but we were asked to not let you see that..."}
   ```
   OR
   ```
   📄 Response Data: {"error":{"code":401,"message":"..."}}
   ```

3. **Token Info:**
   ```
   🔑 Token preview: xxxx...yyyy (length: 32)
   ℹ️ Token appears to be a simple API key (1 segment)
   ```

## 🎯 Most Likely Causes

Based on the error, the most likely causes are:

1. **Warehouse name mismatch** (80% probability)
   - Check Edge Function logs for exact name being sent
   - Compare with Delhivery dashboard

2. **Token lacks pickup permissions** (15% probability)
   - Token works for shipments but not pickups
   - Need to contact Delhivery to enable permissions

3. **Token expired/invalid** (5% probability)
   - Generate new token in Delhivery dashboard
   - Update in Supabase Edge Function secrets

## 📞 Next Steps

1. **Check Edge Function logs** (most important)
2. **Compare warehouse names** character-by-character
3. **If names match:** Contact Delhivery support about token permissions
4. **If names don't match:** Update one to match the other exactly

## 💡 Pro Tip

Copy the warehouse name from Edge Function logs and paste it into Delhivery dashboard search to verify it exists exactly as shown.
