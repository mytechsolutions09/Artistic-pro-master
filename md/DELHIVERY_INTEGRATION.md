# Delhivery Shipping Integration

This document outlines the complete Delhivery shipping API integration implemented in the admin panel.

## 🚀 Features Implemented

### 1. **Comprehensive API Integration**
- ✅ Pin Code Serviceability Check
- ✅ Shipping Rate Calculator
- ✅ Shipment Creation (CMU API)
- ✅ Shipment Tracking
- ✅ Shipment Cancellation
- ✅ Expected TAT Calculator
- ✅ Waybill Generation
- ✅ Pickup Request
- ✅ E-waybill Management
- ✅ Package Information
- ✅ Invoice Charges
- ✅ Packing Slip Generation

### 2. **Admin Panel Integration**
- ✅ Dedicated Shipping Management Page (`/admin/shipping`)
- ✅ Tabbed Interface with 9 functional tabs:
  - **Shipments**: View and manage all shipments
  - **Pin Code Check**: Verify delivery serviceability
  - **Rate Calculator**: Calculate shipping costs
  - **Create Shipment**: Create new shipments
  - **Warehouse**: Create and edit warehouse locations
  - **Advanced Shipment**: Create shipments with custom QC
  - **Generate Waybills**: Generate waybill numbers
  - **Expected TAT**: Calculate delivery time estimates
  - **Request Pickup**: Schedule package pickups

### 3. **API Endpoints Covered**

#### Core Shipping APIs
- `GET /c/api/pin-codes/json/` - Pin code serviceability
- `POST /c/api/shipments/rates/json/` - Shipping rates
- `POST /api/cmu/create.json` - Create shipments
- `GET /c/api/shipments/track/json/` - Track shipments
- `POST /c/api/shipments/cancel/json/` - Cancel shipments

#### Advanced APIs
- `GET /api/dc/expected_tat` - Expected delivery time
- `GET /waybill/api/bulk/json/` - Generate waybills
- `POST /api/p/edit` - Edit/cancel shipments
- `PUT /api/rest/ewaybill/{waybill}/` - E-waybill management
- `GET /api/v1/packages/json/` - Package information
- `GET /api/kinko/v1/invoice/charges/.json` - Invoice charges
- `GET /api/p/packing_slip` - Packing slip generation
- `POST /fm/request/new/` - Pickup requests

#### Warehouse Management APIs
- `PUT /api/backend/clientwarehouse/create/` - Create warehouse
- `POST /api/backend/clientwarehouse/edit/` - Edit warehouse

#### Advanced Shipment APIs
- `POST /api/cmu/create.json` - Advanced shipment creation with custom QC

## 🔧 Configuration

### Environment Setup
```typescript
const DELHIVERY_CONFIG = {
  baseURL: 'https://staging-express.delhivery.com',
  expressBaseURL: 'https://express-dev-test.delhivery.com',
  trackBaseURL: 'https://track.delhivery.com',
  token: 'YOUR_DELHIVERY_API_TOKEN', // Replace with actual token
  timeout: 10000,
};
```

### API Token Setup
1. Replace `'xxxxxxxxxxxxxxxx'` in `src/services/DelhiveryService.ts` with your actual Delhivery API token
2. Update the token in `DELHIVERY_CONFIG.token`

## 📋 Usage Examples

### 1. Check Pin Code Serviceability
```typescript
const serviceability = await delhiveryService.checkPinCodeServiceability('110001');
```

### 2. Generate Waybills
```typescript
const waybills = await delhiveryService.generateWaybills(5);
```

### 3. Create Shipment
```typescript
const shipmentData = {
  shipments: [{
    name: "John Doe",
    add: "123 Main St",
    pin: "110001",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    phone: "9999999999",
    order: "ORDER-001",
    payment_mode: "Prepaid",
    shipment_width: "100",
    shipment_height: "100",
    shipping_mode: "Surface"
  }],
  pickup_location: {
    name: "warehouse_name"
  }
};

const result = await delhiveryService.createShipment(shipmentData);
```

### 4. Calculate Expected TAT
```typescript
const tat = await delhiveryService.getExpectedTAT({
  origin_pin: '122003',
  destination_pin: '136118',
  mot: 'S',
  pdt: 'B2C',
  expected_pickup_date: '2024-05-31'
});
```

### 5. Request Pickup
```typescript
const pickup = await delhiveryService.requestPickup({
  pickup_time: '11:00:00',
  pickup_date: '2024-05-31',
  pickup_location: 'warehouse_name',
  expected_package_count: 1
});
```

### 6. Create Warehouse
```typescript
const warehouse = await delhiveryService.createWarehouseWithValidation({
  phone: '9999999999',
  city: 'Kota',
  name: 'test_name',
  pin: '110042',
  address: 'address',
  country: 'India',
  email: 'abc@gmail.com',
  registered_name: 'registered_account_name',
  return_address: 'return_address',
  return_pin: '110042',
  return_city: 'Kota',
  return_state: 'Delhi',
  return_country: 'India'
});
```

### 7. Edit Warehouse
```typescript
const warehouse = await delhiveryService.editWarehouseWithValidation({
  name: 'registered_wh_name',
  phone: '9988******',
  address: 'HUDA Market, Gurugram, Haryana - 122001'
});
```

### 8. Create Advanced Shipment with Custom QC
```typescript
const advancedShipment = await delhiveryService.createAdvancedShipmentWithWaybill({
  shipments: [{
    client: "pass the registered client name",
    return_name: "test_designs",
    order: "1234567890",
    return_country: "India",
    weight: "150.0 gm",
    city: "Meerjapuram",
    pin: "521111",
    return_state: "Gujarat",
    products_desc: "NEW EI PIKOK (PURPAL-ORANGE)",
    shipping_mode: "Express",
    state: "Andhra Pradesh",
    quantity: 1,
    phone: "1234567890",
    add: "7 106 abc road, 2020 bulding",
    payment_mode: "Pickup",
    order_date: "29-06-2023",
    seller_gst_tin: "ABCD1234F",
    name: "Jitendra Singh",
    return_add: " SHOP NO 218,ABC Road, Mumbai",
    total_amount: 749,
    seller_name: "ABC Design",
    return_city: "SURAT",
    country: "India",
    return_pin: "394101",
    return_phone: "1234567890",
    qc_type: "param",
    custom_qc: [
      {
        item: "mobile",
        description: "Mi note 1 pro",
        images: ["https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-note-pro-2.jpg"],
        return_reason: "Damaged",
        quantity: 1,
        brand: "Mi",
        product_category: "mobile",
        questions: [
          {
            questions_id: "client Question id",
            options: [""],
            value: ["123456543"],
            required: true,
            type: "varchar",
            ques_images: ["http://ecx.images-amazon.com/images/I/414yumheSAS._AC_.jpg"]
          }
        ]
      }
    ]
  }],
  pickup_location: {
    name: "pass the registered pickup WH name"
  }
});
```

## 🎯 Admin Panel Features

### Shipments Tab
- View all shipments in a table format
- Filter by status (pending, picked_up, in_transit, delivered, cancelled)
- Search by customer name, waybill, or pin code
- Track shipments
- Cancel shipments

### Pin Code Check Tab
- Enter pin code to check serviceability
- View detailed serviceability information
- JSON response display

### Rate Calculator Tab
- Calculate shipping rates between pin codes
- Input weight, dimensions, and COD amount
- View detailed rate breakdown

### Create Shipment Tab
- Complete shipment creation form
- Customer details, delivery address, package details
- Automatic waybill assignment
- Real-time validation

### Generate Waybills Tab
- Generate bulk waybill numbers
- Specify quantity (1-100)
- Display generated waybills in grid format

### Expected TAT Tab
- Calculate expected delivery time
- Support for different transport modes (Surface, Air, Rail)
- B2C and B2B product types
- Custom pickup dates

### Request Pickup Tab
- Schedule package pickups
- Set pickup location, date, and time
- Specify expected package count

### Warehouse Tab
- Create new warehouse locations
- Edit existing warehouse details
- Complete address and contact information
- Return address configuration

### Advanced Shipment Tab
- Create shipments with custom QC parameters
- Support for complex product configurations
- Custom quality control questions
- Advanced shipping options

## 🔐 Security & Error Handling

- All API calls include proper error handling
- Token-based authentication
- Input validation on all forms
- User-friendly error messages
- Loading states for all async operations

## 🚀 Getting Started

1. **Replace API Token**: Update the token in `src/services/DelhiveryService.ts`
2. **Access Admin Panel**: Navigate to `/admin/shipping`
3. **Test Functionality**: Use the Pin Code Check tab to verify API connectivity
4. **Create Shipments**: Use the Create Shipment tab for new orders
5. **Manage Operations**: Use other tabs for various shipping operations

## 📝 Notes

- All API endpoints use the staging environment by default
- For production, update the base URLs to production endpoints
- The integration supports both COD and Prepaid shipments
- Waybill generation is automatic for new shipments
- All operations include proper TypeScript typing

## 🔄 Future Enhancements

- [ ] Real-time shipment tracking updates
- [ ] Bulk shipment operations
- [ ] Automated pickup scheduling
- [ ] Integration with order management
- [ ] Delivery confirmation workflows
- [ ] Analytics and reporting
- [ ] Webhook support for status updates
