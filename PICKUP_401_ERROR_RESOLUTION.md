# Resolving 401 Unauthorized Error for Pickup Requests

## 🔍 Current Error

```
401 Unauthorized
"Authentication failed"
```

## 📋 Step-by-Step Resolution

### Step 1: Check Edge Function Logs

**Get the exact Delhivery API response:**

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions
2. Click on `delhivery-api`
3. Click **"Logs"** tab
4. Look for the most recent pickup request logs
5. Find these log entries:
   - `✅ Delhivery API Response Status: 401`
   - `📄 Response Data: {...}`
   - `📦 Request body: {...}`

**What to look for:**
- The exact error message from Delhivery
- The warehouse name being sent
- The request payload format

---

### Step 2: Verify Warehouse Registration Status

**The warehouse must be registered in Delhivery BEFORE pickup requests work.**

#### Option A: Check via Delhivery Dashboard
1. Log into Delhivery One: https://one.delhivery.com/
2. Navigate to **Warehouse Management**
3. Search for: `Lurevi - Janak puri`
4. **If NOT found:** The warehouse is not registered → Go to Step 3
5. **If found:** Verify the exact name matches (case-sensitive, spaces, hyphens)

#### Option B: Try to Create Warehouse (Will fail if already exists)
1. Go to your admin panel: **Shipping Management** → **Warehouses** tab
2. Use the **"Create Warehouse"** form
3. Fill in all details for "Lurevi - Janak puri"
4. Click **"Create Warehouse"**
5. **If successful:** Warehouse is now registered ✅
6. **If error:** Check the error message:
   - "Warehouse already exists" → Warehouse is registered, check name spelling
   - "Invalid data" → Fix the data and try again
   - "401 Unauthorized" → Token permissions issue (see Step 4)

---

### Step 3: Register Warehouse in Delhivery

**If warehouse is NOT registered:**

1. **Go to:** Shipping Management → Warehouses tab
2. **Fill in the form:**
   ```
   Warehouse Name: Lurevi - Janak puri
   Phone: [10-digit number]
   Email: [valid email]
   City: [city name]
   Pin Code: [6-digit pin]
   Address: [complete address]
   Country: India
   Registered Name: [your registered name]
   ```

3. **Click:** "Create Warehouse"
4. **Wait:** 2-5 minutes for Delhivery to process
5. **Verify:** Check Edge Function logs for success response

**Important:** The warehouse name must match EXACTLY:
- ✅ `Lurevi - Janak puri` (with hyphen and spaces)
- ❌ `Lurevi-Janak puri` (no space before hyphen)
- ❌ `Lurevi - Janakpuri` (no space after hyphen)
- ❌ `lurevi - janak puri` (different case)

---

### Step 4: Verify API Token Permissions

**If warehouse IS registered but still getting 401:**

The API token might not have pickup permissions.

1. **Check token works for other APIs:**
   - ✅ Waybill generation works → Token is valid
   - ❌ Pickup fails → Token missing pickup permissions

2. **Contact Delhivery Support:**
   - Email: support@delhivery.com
   - Subject: "API Token Permissions - Pickup Scheduling"
   - Include:
     - Your API token (mention it works for waybills)
     - Warehouse name: "Lurevi - Janak puri"
     - Error: "401 Unauthorized on `/fm/request/new/`"
     - Request: "Please enable pickup scheduling permissions"

---

### Step 5: Verify Request Format

**Check the request payload matches Delhivery's requirements:**

From Edge Function logs, verify:
```json
{
  "pickup_time": "12:00:00",
  "pickup_date": "2026-01-16",
  "warehouse_name": "Lurevi - Janak puri",
  "quantity": 1
}
```

**Requirements:**
- `pickup_time`: Format `HH:MM:SS` (24-hour)
- `pickup_date`: Format `YYYY-MM-DD`
- `warehouse_name`: Must match exactly as registered
- `quantity`: Number of packages

---

### Step 6: Test Again

**After completing Steps 1-5:**

1. Wait 5 minutes after warehouse registration
2. Go to **Pickup Requests** tab
3. Select warehouse: `Lurevi - Janak puri`
4. Set pickup date and time
5. Click **"Request Pickup"**
6. **Should work now!** ✅

---

## 🔧 Common Issues & Solutions

### Issue 1: Warehouse Name Mismatch
**Symptom:** 401 error even after registration  
**Solution:** Copy exact warehouse name from Delhivery dashboard

### Issue 2: Warehouse Not Activated
**Symptom:** Warehouse exists but pickup fails  
**Solution:** Check warehouse status in Delhivery dashboard → Ensure it's "Active"

### Issue 3: Token Permissions
**Symptom:** Waybills work, pickups don't  
**Solution:** Contact Delhivery support to enable pickup permissions

### Issue 4: Staging vs Production
**Symptom:** Works in staging, fails in production  
**Solution:** Ensure warehouse is registered in the correct environment

---

## 📞 Still Having Issues?

**Check these in order:**

1. ✅ Edge Function logs show exact Delhivery error
2. ✅ Warehouse exists in Delhivery dashboard
3. ✅ Warehouse name matches exactly (case-sensitive)
4. ✅ Warehouse is active/enabled
5. ✅ API token has pickup permissions
6. ✅ Request format is correct
7. ✅ Waited 5 minutes after registration

**If all checked and still failing:**
- Contact Delhivery support with Edge Function logs
- Include the exact error message from logs
- Mention warehouse name and API token status

---

## 📝 Quick Checklist

- [ ] Checked Edge Function logs for exact error
- [ ] Verified warehouse exists in Delhivery dashboard
- [ ] Warehouse name matches exactly (case-sensitive)
- [ ] Registered warehouse via admin panel (if needed)
- [ ] Waited 5 minutes after registration
- [ ] Verified API token works for waybills
- [ ] Contacted Delhivery support (if token permissions issue)
- [ ] Tried pickup request again

---

## 🔗 Useful Links

- [Delhivery Warehouse Creation Docs](https://one.delhivery.com/developer-portal/document/b2c/detail/warehouse-creation)
- [Delhivery Developer Portal](https://one.delhivery.com/developer-portal)
- [Supabase Edge Function Logs](https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions/delhivery-api/logs)
