# Updated to New Delhivery LTL API

## What Changed

You were using the **NEW Delhivery LTL (Less Than Truckload) API**, which is completely different from the old Express API.

## Key Changes Made:

### 1. **Edge Function Updated** (`supabase/functions/delhivery-api/index.ts`)
- Added support for `ltl` and `ltl-prod` endpoints
- Changed authentication format based on endpoint:
  - Old API: `Authorization: Token YOUR_TOKEN`
  - New LTL API: `Authorization: Bearer YOUR_TOKEN`
- Added support for `PATCH` method

### 2. **Base URLs Updated**
- **Old API:** `https://staging-express.delhivery.com`
- **New LTL API (Dev):** `https://ltl-clients-api-dev.delhivery.com`
- **New LTL API (Prod):** `https://ltl-clients-api.delhivery.com`

### 3. **Warehouse Creation** (`createWarehouse()`)
**Old Endpoint:** `/api/backend/clientwarehouse/create/` (PUT)  
**New Endpoint:** `/client-warehouse/create/` (POST)

**New Data Format:**
```javascript
{
  name: "Warehouse Name",
  pin_code: "400059",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  address_details: {
    address: "Complete Address",
    contact_person: "Manager Name",
    phone_number: "9186676788",
    email: "contact@example.com"
  },
  business_hours: {
    MON: { start_time: "09:00", close_time: "18:00" },
    TUE: { start_time: "09:00", close_time: "18:00" },
    // ... etc
  },
  pick_up_hours: {
    MON: { start_time: "10:00", close_time: "17:00" },
    // ... etc
  },
  pick_up_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
  business_days: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
  ret_address: {
    pin: "400059",
    address: "Return Address",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India"
  }
}
```

### 4. **Warehouse Update** (`editWarehouse()`)
**Old Endpoint:** `/api/backend/clientwarehouse/edit/` (POST)  
**New Endpoint:** `/client-warehouses/update` (PATCH)

**New Data Format:**
```javascript
{
  cl_warehouse_name: "Warehouse Name",
  update_dict: {
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address_details: {
      address: "New Address",
      contact_person: "Manager",
      phone_number: "9988000000",
      email: "test@gmail.com"
    },
    ret_address: {
      address: "Return Address",
      city: "Mumbai",
      state: "Maharashtra",
      pin: "400059",
      country: "India"
    }
  }
}
```

### 5. **Pickup Requests** (`requestPickup()`)
**Old Endpoint:** `/fm/request/new/` (POST)  
**New Endpoint:** `/pickup_requests` (POST)

**New Data Format:**
```javascript
{
  client_warehouse: "Warehouse Name",
  pickup_date: "2024-07-30",
  start_time: "05:00:00",
  expected_package_count: 1
}
```

---

## Deployment Instructions

### Step 1: Deploy Updated Edge Function
```bash
supabase functions deploy delhivery-api --no-verify-jwt
```

### Step 2: Set Your Delhivery Token
The token format is the **SAME** regardless of which API you use. Just set it once:

```bash
# For development (LTL Dev API)
supabase secrets set DELHIVERY_API_TOKEN=your_token_here
```

**IMPORTANT:** 
- Use ONLY the token value
- NO "Token " or "Bearer " prefix in the secret
- The Edge Function will add the correct prefix based on the endpoint

### Step 3: Rebuild Frontend
```bash
npm run build
```

### Step 4: Test
1. Go to Admin Panel → Shipping → Warehouses
2. Try creating a warehouse
3. Check browser console - should see:
   ```
   📦 Delhivery API Request: POST https://ltl-clients-api-dev.delhivery.com/client-warehouse/create/
   ✅ Delhivery API Response Status: 200
   ```

---

## Authentication Flow

### Old API (Express/CMU)
```
Authorization: Token 8f5d1234567890abcdef1234567890ab
```

### New API (LTL)
```
Authorization: Bearer 8f5d1234567890abcdef1234567890ab
```

The Edge Function now **automatically** adds the correct prefix based on the endpoint:
- `endpoint: 'main'` → Uses `Token YOUR_TOKEN`
- `endpoint: 'ltl'` → Uses `Bearer YOUR_TOKEN`
- `endpoint: 'ltl-prod'` → Uses `Bearer YOUR_TOKEN`

---

## Supported Operations

| Operation | Endpoint | Method | API Type |
|-----------|----------|--------|----------|
| Create Warehouse | `/client-warehouse/create/` | POST | ✅ LTL |
| Update Warehouse | `/client-warehouses/update` | PATCH | ✅ LTL |
| Request Pickup | `/pickup_requests` | POST | ✅ LTL |
| Cancel Pickup | `/pickup_requests/{id}` | DELETE | ✅ LTL |
| Get Label URLs | `/label/get_urls/std/{awb}` | GET | ✅ LTL |

---

## Testing Your Token

Run this to test your token with the new LTL API:

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    pin_code = "400059"
    city = "Mumbai"
    state = "Maharashtra"
    country = "India"
    address_details = @{
        address = "Test Address"
        contact_person = "Test User"
        phone_number = "9876543210"
    }
    name = "TestWarehouse"
    business_hours = @{
        TUE = @{
            start_time = "07:00"
            close_time = "08:30"
        }
    }
    pick_up_hours = @{
        TUE = @{
            start_time = "13:00"
            close_time = "16:00"
        }
    }
    pick_up_days = @("TUE")
    business_days = @("TUE")
    ret_address = @{
        pin = "400059"
        address = "test"
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://ltl-clients-api-dev.delhivery.com/client-warehouse/create/" `
    -Method Post -Headers $headers -Body $body
```

If this works, your token is valid for the LTL API!

---

## Troubleshooting

### Still Getting 401?

1. **Check Token Format**
   - Make sure you're using the actual token, not "Bearer Token" or "Token"
   - Token should be 32-64 characters alphanumeric

2. **Check API Access**
   - Verify your Delhivery account has LTL API access enabled
   - Contact Delhivery to confirm your token works with the LTL API

3. **Check Environment**
   - Dev: Use `ltl-clients-api-dev.delhivery.com`
   - Prod: Use `ltl-clients-api.delhivery.com`
   - Make sure your token matches the environment

4. **Check Edge Function Logs**
   ```bash
   supabase functions logs delhivery-api --tail
   ```
   Look for the actual authorization header being sent

---

## Production Migration

To use production LTL API, change the service call from:
```typescript
this.makeApiCall('/client-warehouse/create/', 'POST', data, 'ltl')
```

To:
```typescript
this.makeApiCall('/client-warehouse/create/', 'POST', data, 'ltl-prod')
```

Or add an environment variable to control this dynamically.

---

## Files Modified

- ✅ `supabase/functions/delhivery-api/index.ts` - Added LTL endpoint support
- ✅ `src/services/DelhiveryService.ts` - Updated warehouse and pickup methods
- ✅ `UPDATE_DELHIVERY_NEW_API.md` - This documentation

---

**Status:** ✅ Updated to use new Delhivery LTL API  
**Date:** October 18, 2025

