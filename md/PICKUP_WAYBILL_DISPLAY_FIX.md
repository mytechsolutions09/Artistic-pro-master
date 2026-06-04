# Pickup Tab - Waybill Display Feature

## Problem
The pickup tab didn't show which shipments (waybills) were available for pickup. Users had to manually enter pickup details without seeing what shipments needed to be picked up.

## Solution Implemented

### 1. **Shipments List in Pickup Tab** 📦
Added a new section that displays all pending shipments with their waybills at the top of the pickup tab.

**Features:**
- ✅ Shows only shipments with `status: 'pending'` (ready for pickup)
- 📋 Displays each shipment's waybill number prominently
- 📍 Shows customer details and delivery address
- ⚖️ Displays weight and COD amount
- ☑️ Checkbox selection for multiple shipments

### 2. **Interactive Selection** 🖱️
Users can now:
- Click on shipment cards to select/deselect them
- Select multiple shipments for a single pickup request
- See visual feedback (pink border) for selected shipments
- View summary of selected waybills

### 3. **Auto-Update Package Count** 🔢
- Expected package count automatically updates based on number of selected shipments
- No need to manually count packages

### 4. **Database Integration** 💾
- Saves pickup date to each selected shipment
- Updates shipment records when pickup is requested
- Automatically refreshes shipment list after pickup request

### 5. **Validation** ✅
- Requires at least one shipment to be selected before requesting pickup
- Prevents empty pickup requests
- Shows clear error messages

## UI Components Added

### Pending Shipments Section
```jsx
{shipments.filter(s => s.status === 'pending').length === 0 ? (
  // Empty state with icon and message
) : (
  // List of selectable shipment cards
)}
```

### Each Shipment Card Shows:
- **Waybill Number** (in monospace font, pink color)
- **Status Badge** ("Pending Pickup" in yellow)
- **Customer Name & Phone**
- **Delivery Address with pincode**
- **Weight, COD amount, Creation date**
- **Checkbox for selection**

### Selection Summary
Shows count of selected shipments and list of waybill numbers in a blue info box.

## Workflow

### Before (Old Flow):
1. Go to Pickup tab
2. Manually enter pickup details
3. Guess package count
4. Request pickup (not linked to specific shipments)

### After (New Flow):
1. Go to Pickup tab
2. **See all pending shipments with waybills**
3. **Select specific shipments for pickup**
4. Enter pickup location, date, time
5. Package count auto-fills
6. Request pickup
7. **Selected shipments get pickup date saved**
8. List refreshes automatically

## Code Changes

### State Added (Line 165):
```typescript
const [selectedShipmentsForPickup, setSelectedShipmentsForPickup] = useState<string[]>([]);
```

### Pickup Handler Updated (Lines 734-781):
```typescript
const handleRequestPickup = async () => {
  // Validate selection
  if (selectedShipmentsForPickup.length === 0) {
    NotificationManager.error('Please select at least one shipment for pickup');
    return;
  }

  // Auto-update package count
  const updatedPickupRequest = {
    ...pickupRequest,
    expected_package_count: selectedShipmentsForPickup.length
  };

  // Request pickup
  const result = await delhiveryService.requestPickup(updatedPickupRequest);
  
  // Update shipments in database
  for (const waybill of selectedShipmentsForPickup) {
    await shippingService.updateShipment(waybill, {
      pickup_date: pickupRequest.pickup_date
    });
  }
  
  // Reload and clear
  loadShipments();
  setSelectedShipmentsForPickup([]);
  
  NotificationManager.success(`Pickup requested for ${selectedShipmentsForPickup.length} shipment(s)`);
};
```

### UI Section Added (Lines 1697-1774):
Complete shipments list with selection functionality.

## Benefits

1. **Visual Clarity** 👁️ - See exactly which shipments need pickup
2. **Accurate Tracking** 📊 - Link pickups to specific waybills
3. **Efficiency** ⚡ - Select multiple shipments at once
4. **Better UX** 🎯 - No manual data entry for package count
5. **Database Sync** 💾 - Automatic tracking of pickup dates

## Screenshots Description

### Empty State:
- Package icon
- "No pending shipments available for pickup"
- Helpful message to create shipments first

### With Shipments:
- Grid of selectable shipment cards
- Each card shows complete shipment info
- Selected cards highlighted in pink
- Summary box showing selected waybills

### Selection Summary:
- Blue info box at bottom
- Count of selected shipments
- List of waybill numbers as tags

## Files Modified
- `src/pages/admin/Shipping.tsx` - Added shipments display and selection logic

## Date
October 17, 2025

