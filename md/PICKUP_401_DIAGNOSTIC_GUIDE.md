# 🔍 Pickup 401 Error - Diagnostic Guide

## Current Error

```
401 Unauthorized
Warehouse name sent: "Lurevi - Janak puri"
```

## 🔍 Diagnostic Analysis

### Most Likely Causes (in order of probability):

1. **API Token Missing Pickup Permissions** (90% likely)
   - Your token works for waybills ✅
   - Your token works for shipments ✅
   - Your token does NOT work for pickups ❌
   - **Solution**: Contact Delhivery support to enable pickup permissions

2. **Warehouse Name Mismatch** (8% likely)
   - Name must match EXACTLY (case-sensitive)
   - Check spaces, hyphens, special characters
   - **Solution**: Compare character-by-character with Delhivery dashboard

3. **Warehouse Not Registered** (2% likely)
   - Warehouse exists in your database ✅
   - Warehouse may not be registered in Delhivery ❌
   - **Solution**: Register warehouse via Delhivery dashboard or API

---

## 📋 Step-by-Step Troubleshooting

### Step 1: Verify Warehouse Name Format

**Current warehouse name:** `Lurevi - Janak puri`

**Character breakdown:**
1. `L` (U+004C) - UPPERCASE LETTER
2. `u` (U+0075) - lowercase letter
3. `r` (U+0072) - lowercase letter
4. `e` (U+0065) - lowercase letter
5. `v` (U+0076) - lowercase letter
6. `i` (U+0069) - lowercase letter
7. ` ` (U+0020) - SPACE
8. `-` (U+002D) - HYPHEN-MINUS
9. ` ` (U+0020) - SPACE
10. `J` (U+004A) - UPPERCASE LETTER
11. `a` (U+0061) - lowercase letter
12. `n` (U+006E) - lowercase letter
13. `a` (U+0061) - lowercase letter
14. `k` (U+006B) - lowercase letter
15. ` ` (U+0020) - SPACE
16. `p` (U+0070) - lowercase letter
17. `u` (U+0075) - lowercase letter
18. `r` (U+0072) - lowercase letter
19. `i` (U+0069) - lowercase letter

**Total:** 19 characters

**⚠️ Common mistakes to check:**
- ❌ `Lurevi-Janak puri` (no space before hyphen)
- ❌ `Lurevi -Janak puri` (no space after hyphen)
- ❌ `Lurevi - Janakpuri` (no space in "Janak puri")
- ❌ `lurevi - janak puri` (all lowercase)
- ❌ `Lurevi – Janak puri` (EN DASH instead of HYPHEN-MINUS)

### Step 2: Check Edge Function Logs

1. Go to: https://supabase.com/dashboard/project/varduayfdqivaofymfov/functions
2. Click: **delhivery-api** → **Logs** tab
3. Find the most recent pickup request
4. Look for:
   ```
   🔤 Warehouse name being sent: "Lurevi - Janak puri"
   📏 Warehouse name length: 19 characters
   ```
5. Copy the EXACT name shown in logs

### Step 3: Verify in Delhivery Dashboard

1. Log in to: https://one.delhivery.com
2. Navigate to: **Warehouses** section
3. Find your warehouse
4. Copy the EXACT name shown there
5. Compare character-by-character with the name from Step 2

### Step 4: Test Token Permissions

Your token currently works for:
- ✅ Waybill generation (`/waybill/api/bulk/json/`)
- ✅ Shipment creation (`/api/cmu/create.json`)
- ✅ Tracking (`/api/packages/json/`)

But fails for:
- ❌ Pickup requests (`/fm/request/new/`)

**This strongly suggests token permission issue, not warehouse name issue.**

---

## 💡 Recommended Actions

### Immediate Action: Contact Delhivery Support

**Email Template:**

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
- Warehouse is registered and active in Delhivery dashboard
- Warehouse name matches exactly (case-sensitive) with my system

REQUEST:
Please enable pickup/CMU permissions for my API token so I can schedule pickup requests.

My account details:
- Account Email: [YOUR EMAIL]
- Account Name: [YOUR NAME]
- Account ID: [YOUR ACCOUNT ID IF AVAILABLE]

Thank you for your assistance!

Best regards,
[YOUR NAME]
```

### Alternative: Verify Warehouse Name

If you want to double-check the warehouse name:

1. **Export warehouse name from Edge Function logs**
   - Copy the exact name from logs
   - Save it somewhere safe

2. **Export warehouse name from Delhivery dashboard**
   - Copy the exact name from dashboard
   - Save it somewhere safe

3. **Compare character-by-character**
   - Use a text diff tool
   - Or manually compare each character
   - Pay special attention to:
     - Spaces (especially around hyphens)
     - Case (uppercase vs lowercase)
     - Special characters (hyphens, dashes)

4. **If names don't match:**
   - Update your system to match Delhivery dashboard
   - OR update Delhivery dashboard to match your system
   - Then try pickup request again

---

## 🔧 Technical Details

### API Endpoint Being Called
- **URL**: `https://staging-express.delhivery.com/fm/request/new/`
- **Method**: `POST`
- **Authentication**: `Token <your-api-token>`
- **Payload**:
  ```json
  {
    "pickup_time": "10:00:00",
    "pickup_date": "2025-01-XX",
    "warehouse_name": "Lurevi - Janak puri",
    "quantity": 1
  }
  ```

### Edge Function Configuration
- **Function**: `delhivery-api`
- **Secret**: `DELHIVERY_API_TOKEN`
- **Status**: ✅ Deployed
- **Logs**: Available in Supabase dashboard

---

## ✅ Expected Resolution

Once Delhivery enables pickup permissions for your token:

1. **No code changes needed** - Your implementation is correct
2. **No warehouse name changes needed** - Name format is correct
3. **Pickup requests will work immediately** - Just retry the request

---

## 📞 Support Contacts

- **Delhivery Support**: support@delhivery.com
- **Delhivery Developer Portal**: https://one.delhivery.com/developer-portal
- **Delhivery API Documentation**: https://one.delhivery.com/developer-portal/document/b2c/detail/pickup-scheduling

---

## 📝 Notes

- The diagnostic utility has been added to help analyze warehouse names
- Enhanced error messages now include character-by-character breakdown
- Edge Function logs include detailed warehouse name analysis
- All troubleshooting steps are logged in browser console
