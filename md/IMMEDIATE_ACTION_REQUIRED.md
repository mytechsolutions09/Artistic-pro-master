# ⚠️ IMMEDIATE ACTION REQUIRED: Fix 401 Pickup Error

## 🔴 Current Problem

**Error:** `401 Unauthorized` when requesting pickup  
**Warehouse:** `Lurevi - Janak puri`  
**Status:** Warehouse exists in your database but **NOT registered in Delhivery**

---

## ✅ SOLUTION: Register Warehouse in Delhivery

### Step 1: Go to Warehouses Tab
1. Open your admin panel
2. Navigate to: **Shipping Management** → **Warehouses** tab

### Step 2: Create Warehouse in Delhivery
1. Scroll to **"Create New Warehouse"** form
2. Fill in ALL required fields:
   ```
   Warehouse Name: Lurevi - Janak puri  ← MUST MATCH EXACTLY
   Phone: [10-digit number]
   Email: [valid email]
   City: [your city]
   Pin Code: [6-digit pin]
   Address: [complete address]
   Country: India
   Registered Name: [your registered name]
   ```
3. Click **"Create Warehouse"** button
4. **Wait 5 minutes** for Delhivery to process

### Step 3: Verify Success
- Check the result message below the form
- Should say: **"Warehouse created in Delhivery and saved to database!"**
- If error: Check the error message and fix the data

### Step 4: Try Pickup Again
- Go back to **Pickup Requests** tab
- Select warehouse: `Lurevi - Janak puri`
- Set date and time
- Click **"Request Pickup"**
- **Should work now!** ✅

---

## 🔍 Why This Happens

Delhivery requires warehouses to be **registered in their system** before you can request pickups. Your warehouse exists in your Supabase database, but Delhivery doesn't know about it yet.

**The registration process:**
1. Creates the warehouse in Delhivery's system
2. Links it to your API token
3. Enables pickup requests for that warehouse

---

## ⚠️ Important Notes

1. **Warehouse name must match EXACTLY:**
   - ✅ `Lurevi - Janak puri` (with space before hyphen)
   - ❌ `Lurevi-Janak puri` (no space)
   - ❌ `lurevi - janak puri` (different case)

2. **Wait time:** After creating, wait 5 minutes before trying pickup

3. **If still fails:** Contact Delhivery support to:
   - Verify warehouse registration
   - Enable pickup permissions for your API token

---

## 📞 Need Help?

If warehouse creation fails or pickup still doesn't work:
1. Check Edge Function logs in Supabase dashboard
2. Verify warehouse name matches exactly
3. Contact Delhivery support with:
   - Your API token (mention it works for waybills)
   - Warehouse name: "Lurevi - Janak puri"
   - Error: 401 Unauthorized on `/fm/request/new/`

---

**Next Step:** Go to Warehouses tab → Create Warehouse → Wait 5 minutes → Try pickup again!
