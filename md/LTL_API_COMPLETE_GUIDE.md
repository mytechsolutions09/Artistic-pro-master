# Complete Delhivery LTL API Integration Guide

## ✅ All Endpoints Updated

Your integration now supports the **NEW Delhivery LTL API** with all the endpoints you provided.

---

## Authentication

### Token Format
- **LTL API:** `Authorization: Bearer YOUR_TOKEN`
- **Old Express API:** `Authorization: Token YOUR_TOKEN`

The Edge Function automatically uses the correct format based on endpoint.

---

## Supported Endpoints

### 1. **Create Warehouse**
```typescript
const result = await delhiveryService.createWarehouse({
  name: 'My Warehouse',
  pin: '400059',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  address: 'Complete Address',
  phone: '9876543210',
  email: 'warehouse@example.com'
});
```

**API Endpoint:** `POST /client-warehouse/create/`

### 2. **Update Warehouse**
```typescript
const result = await delhiveryService.editWarehouse({
  name: 'My Warehouse',
  city: 'Mumbai',
  address: 'Updated Address',
  phone: '9876543210',
  // ... other fields
});
```

**API Endpoint:** `PATCH /client-warehouses/update`

### 3. **Request Pickup**
```typescript
const result = await delhiveryService.requestPickup({
  pickup_location: 'My Warehouse',
  pickup_date: '2024-07-30',
  pickup_time: '10:00:00',
  expected_package_count: 5
});
```

**API Endpoint:** `POST /pickup_requests`

### 4. **Cancel Pickup**
```typescript
const result = await delhiveryService.cancelPickup('pickup_id_123');
```

**API Endpoint:** `DELETE /pickup_requests/{pickup_id}`

### 5. **Create Manifest** ⭐ NEW
```typescript
const result = await delhiveryService.createManifest({
  pickup_location_name: 'My Warehouse',
  payment_mode: 'cod',
  cod_amount: '122',
  weight: '100',
  dropoff_location: {
    consignee_name: 'Customer Name',
    address: 'Delivery Address',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    phone: '9876543210',
    email: 'customer@example.com'
  },
  shipment_details: [{
    order_id: 'ORD123',
    box_count: 1,
    description: 'Product Description',
    weight: 100,
    waybills: [],
    master: false
  }],
  invoices: [{
    inv_num: 'INV123',
    inv_amt: 122
  }],
  rov_insurance: true,
  fm_pickup: false,
  freight_mode: 'fop'
});
```

**API Endpoint:** `POST /manifest`  
**Content-Type:** `multipart/form-data` (supports file uploads)

### 6. **Get Label URLs**
```typescript
const result = await delhiveryService.getLabelUrls('220041149');
```

**API Endpoint:** `GET /label/get_urls/std/{awb}`

---

## Edge Function Features

### Automatic Content-Type Detection
- **JSON requests:** `Content-Type: application/json`
- **FormData requests:** `Content-Type: multipart/form-data`

### Automatic Auth Header Format
- `endpoint: 'ltl'` → `Authorization: Bearer TOKEN`
- `endpoint: 'main'` → `Authorization: Token TOKEN`

### Supported HTTP Methods
- GET
- POST
- PUT
- PATCH ⭐ NEW
- DELETE

---

## Environment Setup

### Development (LTL API)
- Base URL: `https://ltl-clients-api-dev.delhivery.com`
- Endpoint parameter: `'ltl'`

### Production (LTL API)
- Base URL: `https://ltl-clients-api.delhivery.com`
- Endpoint parameter: `'ltl-prod'`

---

## Quick Start

### 1. Set Your Token
```bash
supabase secrets set DELHIVERY_API_TOKEN=your_token_here
```

### 2. Deploy Edge Function
```bash
supabase functions deploy delhivery-api --no-verify-jwt
```

### 3. Test from Admin Panel
```javascript
// In browser console
const { data, error } = await supabase.functions.invoke('delhivery-api', {
  body: {
    action: '/client-warehouse/create/',
    method: 'POST',
    endpoint: 'ltl',
    data: {
      name: 'Test Warehouse',
      pin_code: '400059',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address_details: {
        address: 'Test Address',
        contact_person: 'Test User',
        phone_number: '9876543210'
      },
      business_hours: {
        MON: { start_time: '09:00', close_time: '18:00' }
      },
      pick_up_hours: {
        MON: { start_time: '10:00', close_time: '17:00' }
      },
      pick_up_days: ['MON'],
      business_days: ['MON'],
      ret_address: {
        pin: '400059',
        address: 'Return Address'
      }
    }
  }
});

console.log(data, error);
```

---

## Complete API Mapping

| Operation | Old API | New LTL API | Method | Status |
|-----------|---------|-------------|--------|--------|
| Create Warehouse | `/api/backend/clientwarehouse/create/` | `/client-warehouse/create/` | POST | ✅ |
| Edit Warehouse | `/api/backend/clientwarehouse/edit/` | `/client-warehouses/update` | PATCH | ✅ |
| Request Pickup | `/fm/request/new/` | `/pickup_requests` | POST | ✅ |
| Cancel Pickup | N/A | `/pickup_requests/{id}` | DELETE | ✅ |
| Create Manifest | N/A | `/manifest` | POST | ✅ NEW |
| Get Label | N/A | `/label/get_urls/std/{awb}` | GET | ✅ NEW |

---

## Files Modified

1. ✅ `supabase/functions/delhivery-api/index.ts`
   - Added FormData support for file uploads
   - Added PATCH method support
   - Added LTL endpoint support with Bearer auth
   - Dynamic content-type handling

2. ✅ `src/services/DelhiveryService.ts`
   - Updated `createWarehouse()` to use LTL API format
   - Updated `editWarehouse()` to use LTL API format (PATCH)
   - Updated `requestPickup()` to use LTL API format
   - Added `createManifest()` method with FormData support
   - Added `ManifestRequest` interface

3. ✅ Documentation files created:
   - `UPDATE_DELHIVERY_NEW_API.md`
   - `LTL_API_COMPLETE_GUIDE.md` (this file)
   - `DEBUG_DELHIVERY_401.md`
   - Test scripts

---

## Testing

### Test Warehouse Creation
```bash
curl -X POST https://ltl-clients-api-dev.delhivery.com/client-warehouse/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Warehouse",
    "pin_code": "400059",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "address_details": {
      "address": "Test Address",
      "contact_person": "Manager",
      "phone_number": "9876543210"
    },
    "business_hours": {
      "MON": {"start_time": "09:00", "close_time": "18:00"}
    },
    "pick_up_hours": {
      "MON": {"start_time": "10:00", "close_time": "17:00"}
    },
    "pick_up_days": ["MON"],
    "business_days": ["MON"],
    "ret_address": {
      "pin": "400059",
      "address": "Return Address"
    }
  }'
```

### Check Edge Function Logs
```bash
supabase functions logs delhivery-api --tail
```

Look for:
- `📦 Delhivery API Request: POST https://ltl-clients-api-dev.delhivery.com/...`
- `✅ Delhivery API Response Status: 200`

---

## Troubleshooting

### Still Getting 401?

1. **Verify token is set:**
   ```bash
   supabase secrets list
   ```

2. **Test token directly:**
   ```bash
   curl -X POST https://ltl-clients-api-dev.delhivery.com/client-warehouse/create/ \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "test"}'
   ```

3. **Check Edge Function logs:**
   ```bash
   supabase functions logs delhivery-api
   ```

4. **Verify you have LTL API access:**
   - Contact Delhivery support
   - Confirm your account has LTL API enabled
   - Make sure you're using the correct token for LTL API

### FormData Not Working?

Make sure:
1. Content-Type header includes `multipart/form-data`
2. FormData includes `action`, `endpoint`, and `method` fields
3. File is properly attached to FormData

---

## Production Checklist

- [ ] Test all endpoints in dev environment
- [ ] Get production LTL API token from Delhivery
- [ ] Set production token: `supabase secrets set DELHIVERY_API_TOKEN=PROD_TOKEN`
- [ ] Update code to use `'ltl-prod'` endpoint for production
- [ ] Deploy Edge Function to production
- [ ] Test warehouse creation in production
- [ ] Test manifest creation with real orders

---

## Support

- **Delhivery Support:** support@delhivery.com
- **Delhivery Dashboard:** https://account.delhivery.com/
- **API Documentation:** Contact Delhivery for LTL API docs

---

**Last Updated:** October 18, 2025  
**Status:** ✅ Fully integrated with Delhivery LTL API

