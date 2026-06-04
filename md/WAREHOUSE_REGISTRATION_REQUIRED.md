# Warehouse Registration Required for Pickup Requests

## 🔍 Root Cause of 401 Error

The **401 Unauthorized** error for pickup requests occurs because:

1. ✅ Your warehouse exists in **Supabase database**
2. ❌ Your warehouse is **NOT registered in Delhivery's system**
3. ❌ Delhivery doesn't recognize the warehouse name when you request a pickup

## 📋 Solution: Register Warehouse in Delhivery First

According to [Delhivery's warehouse creation documentation](https://one.delhivery.com/developer-portal/document/b2c/detail/warehouse-creation), you must:

### Step 1: Create Warehouse in Delhivery

**Via Admin Panel:**
1. Go to **Shipping Management** → **Warehouses** tab
2. Find your warehouse "Lurevi - Janak puri"
3. Click **"Create in Delhivery"** button (if available)
4. Or use the **"Create Warehouse"** form with all required details

**Required Fields:**
- Warehouse Name: `Lurevi - Janak puri` (must match exactly)
- Address: Complete address
- Pin Code: 6-digit pin code
- City: City name
- State: State name
- Country: India
- Phone: 10-digit phone number
- Email: Valid email address
- Contact Person: Registered name

### Step 2: Verify Warehouse Registration

After creating the warehouse:
1. Check Edge Function logs for success response
2. Verify warehouse name matches exactly (case-sensitive, spaces, hyphens)
3. Wait a few minutes for Delhivery to process the registration

### Step 3: Try Pickup Request Again

Once the warehouse is registered:
1. Go to **Pickup Requests** tab
2. Select warehouse: `Lurevi - Janak puri`
3. Schedule pickup
4. Should work now! ✅

---

## 🔧 Technical Details

### Warehouse Creation API
- **Endpoint:** `/client-warehouse/create/`
- **Method:** `POST`
- **API Type:** LTL API
- **Authentication:** `Bearer <token>`
- **Base URL:** `https://ltl-clients-api-dev.delhivery.com` (staging)

### Pickup Request API
- **Endpoint:** `/fm/request/new/`
- **Method:** `POST`
- **API Type:** Express API
- **Authentication:** `Token <token>`
- **Base URL:** `https://staging-express.delhivery.com`

**Important:** These use different APIs but the same token!

---

## ⚠️ Common Issues

### Issue 1: Warehouse Name Mismatch
- **Problem:** Name in database doesn't match Delhivery
- **Solution:** Use exact name from Delhivery dashboard

### Issue 2: Warehouse Not Active
- **Problem:** Warehouse created but not activated
- **Solution:** Check Delhivery dashboard → Warehouses → Verify status

### Issue 3: Token Permissions
- **Problem:** Token doesn't have warehouse/pickup permissions
- **Solution:** Contact Delhivery support to enable permissions

---

## 📞 Next Steps

1. **Create warehouse in Delhivery** using the admin panel
2. **Verify registration** in Edge Function logs
3. **Test pickup request** again
4. **If still failing:** Contact Delhivery support with:
   - Your API token (mention it works for waybills)
   - Warehouse name: "Lurevi - Janak puri"
   - Error: 401 Unauthorized on `/fm/request/new/`
   - Request: Enable pickup scheduling permissions

---

## 🔗 References

- [Delhivery Warehouse Creation Documentation](https://one.delhivery.com/developer-portal/document/b2c/detail/warehouse-creation)
- [Delhivery Developer Portal](https://one.delhivery.com/developer-portal)
- [API Token Generation Guide](https://help.delhivery.com/docs/api-token-generation)
