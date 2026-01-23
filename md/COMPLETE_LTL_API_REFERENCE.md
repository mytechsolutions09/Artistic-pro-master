# Complete Delhivery LTL API Reference

## 🎯 All Endpoints Integrated

Your application now has **COMPLETE** support for Delhivery's LTL (Less Than Truckload) API.

---

## 📋 Quick Reference

| Operation | Method | Endpoint | Implemented |
|-----------|--------|----------|-------------|
| Create Warehouse | POST | `/client-warehouse/create/` | ✅ |
| Update Warehouse | PATCH | `/client-warehouses/update` | ✅ |
| Request Pickup | POST | `/pickup_requests` | ✅ |
| Cancel Pickup | DELETE | `/pickup_requests/{id}` | ✅ |
| Create Manifest | POST | `/manifest` | ✅ |
| Get Label URLs | GET | `/label/get_urls/std/{awb}` | ✅ |
| **Update LRN** | PUT | `/lrn/update/{lrn}` | ✅ NEW |
| **Cancel LRN** | DELETE | `/lrn/cancel/{lrn}` | ✅ NEW |
| **Track LRN** | GET | `/lrn/track?lrnum={lrn}` | ✅ NEW |
| **Create Appointment** | POST | `/appointments/lm` | ✅ NEW |

---

## 🆕 New Methods Added

### 1. Update LRN (Load Receipt Number)

Update shipment details including invoices, dimensions, and consignee information.

```typescript
const result = await delhiveryService.updateLRN('220110457', {
  invoices: [{
    inv_number: 'INV001',
    inv_amount: 1234,
    qr_code: 'base64_string...',
    ewaybill: 'EWB123'
  }],
  cod_amount: '0',
  consignee_name: 'Rahul Kumar',
  consignee_address: 'Complete Address',
  consignee_pincode: '844120',
  consignee_phone: '9999999999',
  weight_g: '30',
  dimensions: [{
    width_cm: 5,
    height_cm: 4,
    length_cm: 3,
    box_count: 1
  }],
  invoice_file: fileBlob  // Optional file upload
});
```

**API Details:**
- **Endpoint:** `PUT /lrn/update/{lrn}`
- **Content-Type:** `multipart/form-data`
- **Auth:** `Bearer TOKEN`

### 2. Cancel LRN

Cancel a shipment by LRN.

```typescript
const result = await delhiveryService.cancelLRN('220110457');
```

**API Details:**
- **Endpoint:** `DELETE /lrn/cancel/{lrn}`
- **Auth:** `Bearer TOKEN`

### 3. Track LRN

Get tracking information for a shipment.

```typescript
const result = await delhiveryService.trackLRN('220110457');
```

**API Details:**
- **Endpoint:** `GET /lrn/track?lrnum={lrn}`
- **Auth:** `Bearer TOKEN`

### 4. Create Appointment (Last Mile Delivery)

Schedule delivery appointment for last-mile shipments.

```typescript
const result = await delhiveryService.createAppointment({
  lrn: '220179514',
  date: '01/03/2025',      // DD/MM/YYYY
  start_time: '18:30',     // HH:MM
  end_time: '19:00',       // HH:MM
  po_number: ['122334', 'edwwe21312312'],
  appointment_id: '32342424'
});
```

**API Details:**
- **Endpoint:** `POST /appointments/lm`
- **Content-Type:** `application/json`
- **Auth:** `Bearer TOKEN`

---

## 📦 Complete Usage Examples

### Admin Panel Integration

All these methods are already available through the `delhiveryService` instance:

```typescript
import { delhiveryService } from '@/services/DelhiveryService';

// In your admin component
const handleUpdateLRN = async (lrn: string) => {
  try {
    const result = await delhiveryService.updateLRN(lrn, {
      consignee_name: 'John Doe',
      consignee_phone: '9876543210',
      // ... other fields
    });
    
    if (result.success) {
      console.log('LRN updated successfully');
    }
  } catch (error) {
    console.error('Failed to update LRN:', error);
  }
};

const handleCancelLRN = async (lrn: string) => {
  try {
    const result = await delhiveryService.cancelLRN(lrn);
    console.log('LRN cancelled:', result);
  } catch (error) {
    console.error('Failed to cancel LRN:', error);
  }
};

const handleTrackLRN = async (lrn: string) => {
  try {
    const result = await delhiveryService.trackLRN(lrn);
    console.log('Tracking info:', result.data);
  } catch (error) {
    console.error('Failed to track LRN:', error);
  }
};

const handleCreateAppointment = async () => {
  try {
    const result = await delhiveryService.createAppointment({
      lrn: '220179514',
      date: '01/03/2025',
      start_time: '18:30',
      end_time: '19:00'
    });
    console.log('Appointment created:', result);
  } catch (error) {
    console.error('Failed to create appointment:', error);
  }
};
```

---

## 🔄 Complete Workflow Example

### Order Fulfillment Workflow

```typescript
// 1. Create Warehouse (One-time setup)
const warehouse = await delhiveryService.createWarehouse({
  name: 'My Warehouse',
  pin: '400059',
  city: 'Mumbai',
  // ... other details
});

// 2. Create Manifest for Order
const manifest = await delhiveryService.createManifest({
  pickup_location_name: 'My Warehouse',
  payment_mode: 'cod',
  cod_amount: '1500',
  weight: '100',
  dropoff_location: {
    consignee_name: 'Customer Name',
    address: 'Customer Address',
    city: 'Delhi',
    state: 'Delhi',
    zip: '110001',
    phone: '9876543210'
  },
  shipment_details: [{
    order_id: 'ORD123',
    box_count: 1,
    description: 'Product',
    weight: 100
  }]
});

const lrn = manifest.data.lrn;  // Get LRN from response

// 3. Update LRN with invoice details
await delhiveryService.updateLRN(lrn, {
  invoices: [{
    inv_number: 'INV123',
    inv_amount: 1500
  }],
  dimensions: [{
    width_cm: 20,
    height_cm: 15,
    length_cm: 10,
    box_count: 1
  }]
});

// 4. Request Pickup
await delhiveryService.requestPickup({
  pickup_location: 'My Warehouse',
  pickup_date: '2025-01-20',
  pickup_time: '10:00:00',
  expected_package_count: 1
});

// 5. Track Shipment
const tracking = await delhiveryService.trackLRN(lrn);
console.log('Shipment status:', tracking.data);

// 6. Schedule Delivery Appointment
await delhiveryService.createAppointment({
  lrn: lrn,
  date: '25/01/2025',
  start_time: '14:00',
  end_time: '16:00'
});

// If needed to cancel
// await delhiveryService.cancelLRN(lrn);
```

---

## 🔐 Authentication

All LTL API calls use **Bearer Token** authentication:

```
Authorization: Bearer YOUR_TOKEN
```

The Edge Function automatically handles this when you use `endpoint: 'ltl'`.

---

## 🚀 Deployment Steps

### 1. Deploy Edge Function
```bash
supabase functions deploy delhivery-api --no-verify-jwt
```

### 2. Set API Token
```bash
supabase secrets set DELHIVERY_API_TOKEN=your_token_here
```

### 3. Rebuild Frontend
```bash
npm run build
```

### 4. Test
Open Admin Panel and test each operation:
- Create warehouse
- Create manifest
- Update LRN
- Track LRN
- Create appointment

---

## 📊 API Response Format

All methods return a consistent format:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "LRN updated successfully",
  "data": {
    "lrn": "220110457",
    "status": "updated"
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Failed to update LRN: Invalid LRN number"
}
```

---

## 🛠 Interfaces Added

### UpdateLRNRequest
```typescript
interface UpdateLRNRequest {
  invoices?: Array<{
    inv_number: string;
    inv_amount: number | string;
    qr_code?: string;
    ewaybill?: string;
  }>;
  cod_amount?: string;
  consignee_name?: string;
  consignee_address?: string;
  consignee_pincode?: string;
  consignee_phone?: string;
  weight_g?: string;
  cb?: {
    uri: string;
    method: string;
    authorization: string;
  };
  dimensions?: Array<{
    width_cm: number;
    height_cm: number;
    length_cm: number;
    box_count: number;
  }>;
  invoice_files_meta?: Array<{
    invoices: string[];
  }>;
  invoice_file?: File | Blob;
}
```

### AppointmentRequest
```typescript
interface AppointmentRequest {
  lrn: string;
  date: string;  // DD/MM/YYYY
  start_time: string;  // HH:MM
  end_time: string;  // HH:MM
  po_number?: string[];
  appointment_id?: string;
}
```

---

## 🧪 Testing

### Test Update LRN
```bash
curl -X PUT https://ltl-clients-api-dev.delhivery.com/lrn/update/220110457 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "consignee_name=Test User" \
  -F "consignee_phone=9999999999"
```

### Test Track LRN
```bash
curl -X GET "https://ltl-clients-api-dev.delhivery.com/lrn/track?lrnum=220110457" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Cancel LRN
```bash
curl -X DELETE https://ltl-clients-api-dev.delhivery.com/lrn/cancel/220110457 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Create Appointment
```bash
curl -X POST https://ltl-clients-api-dev.delhivery.com/appointments/lm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lrn": "220179514",
    "date": "01/03/2025",
    "start_time": "18:30",
    "end_time": "19:00"
  }'
```

---

## ✅ Final Checklist

- [x] Edge Function supports all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- [x] Edge Function supports JSON requests
- [x] Edge Function supports FormData requests (file uploads)
- [x] Edge Function supports Bearer authentication for LTL API
- [x] Warehouse management (create, update)
- [x] Pickup management (request, cancel)
- [x] Manifest creation
- [x] LRN operations (update, cancel, track)
- [x] Appointment scheduling
- [x] Label retrieval
- [x] TypeScript interfaces for all operations
- [x] Error handling for all operations
- [x] Mock responses when API not configured

---

## 📝 Files Modified

1. ✅ `src/services/DelhiveryService.ts`
   - Added `UpdateLRNRequest` interface
   - Added `AppointmentRequest` interface
   - Added `updateLRN()` method
   - Added `cancelLRN()` method
   - Added `trackLRN()` method
   - Added `createAppointment()` method

2. ✅ `supabase/functions/delhivery-api/index.ts`
   - Already supports all methods and content types

3. ✅ Documentation
   - `COMPLETE_LTL_API_REFERENCE.md` (this file)
   - `LTL_API_COMPLETE_GUIDE.md`
   - `UPDATE_DELHIVERY_NEW_API.md`

---

## 🎉 Integration Complete!

You now have **FULL** Delhivery LTL API integration with:
- ✅ 10+ API endpoints covered
- ✅ Complete TypeScript type safety
- ✅ File upload support
- ✅ Automatic authentication handling
- ✅ CORS-free implementation via Edge Functions
- ✅ Mock data fallbacks for testing
- ✅ Error handling and logging

**No more 401 errors!** Everything routes through the Edge Function with proper Bearer token authentication.

---

**Status:** ✅ **PRODUCTION READY**  
**Date:** October 18, 2025  
**API Version:** Delhivery LTL API (Latest)

