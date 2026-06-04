# 🚀 Shipping Module - Quick Start Guide

## ⚡ Get Started in 3 Steps (5 Minutes)

---

## Step 1: Set Up Database Tables (2 minutes)

### Option A: PowerShell Script (Windows - Easiest)
```powershell
.\setup-shipping-database.ps1
```
Follow the on-screen menu.

### Option B: Manual (Any Platform)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Open `shipping_database_setup.sql` file
5. Copy **all contents** (Ctrl+A, Ctrl+C)
6. Paste into SQL Editor (Ctrl+V)
7. Click **Run** button (bottom right)
8. Wait for "Success" ✅

**What this creates:**
- ✅ 8 database tables
- ✅ Indexes for fast queries
- ✅ Sample data (2 warehouses, 2 shipments)

---

## Step 2: Start Your App (1 minute)

```bash
npm run dev
```

---

## Step 3: Access Shipping Module (30 seconds)

1. **Login as admin**
2. **Click "Shipping"** in sidebar, OR
3. **Go to:** `http://localhost:5173/admin/shipping`

---

## 🎉 You're Done!

You should now see:

### ✅ 9 Tabs Available:
1. 📦 **Shipments** - 2 sample shipments loaded from database
2. 📍 **Pin Code Check** - Check delivery availability
3. 💰 **Rate Calculator** - Calculate shipping costs
4. ➕ **Create Shipment** - Create new shipments + import orders
5. 🏭 **Warehouse** - Manage warehouses
6. ⚙️ **Advanced Shipment** - Advanced options
7. 📋 **Generate Waybills** - Bulk waybill generation
8. ⏱️ **Expected TAT** - Delivery time estimates
9. 🚛 **Request Pickup** - Schedule pickups

---

## 🧪 Quick Test

### Test 1: View Sample Shipments
1. You're already on "Shipments" tab
2. Should see 2 sample shipments:
   - DL123456789 - John Doe - Mumbai
   - DL987654321 - Jane Smith - Delhi
3. ✅ These are loaded from your database!

### Test 2: Create a Warehouse
1. Click **"Warehouse"** tab
2. Fill in:
   - Name: "My Test Warehouse"
   - Phone: "+91 1234567890"
   - Email: "warehouse@test.com"
   - City: "Mumbai"
   - Pin: "400001"
   - Address: "123 Test St"
3. Click **"Create Warehouse"**
4. ✅ Should see success message!
5. Go to Supabase → warehouses table → See your warehouse!

### Test 3: Create a Shipment
1. Click **"Create Shipment"** tab
2. Fill in customer details:
   - Name: "Test Customer"
   - Phone: "+91 9876543210"
   - Address: "456 Test Ave"
   - Pincode: "110001"
   - City: "Delhi"
   - State: "Delhi"
   - Weight: "1"
3. Click **"Create Shipment"**
4. ✅ Should see success with waybill number!
5. Go back to **"Shipments"** tab → See your new shipment!

### Test 4: Import an Order
1. Go to **"Create Shipment"** tab
2. Click **"Import Orders"** button
3. If you have orders: Select one and click **"Import"**
4. Form auto-fills with order details!
5. Click **"Create Shipment"**
6. ✅ Shipment linked to order!

---

## 💡 Quick Tips

### Using Mock Mode (Default)
- No Delhivery API needed for testing
- All operations work with simulated data
- Success messages show "(mock mode)"
- Perfect for development and testing

### Adding Real Delhivery API
Add to `.env`:
```env
VITE_DELHIVERY_API_TOKEN=your-real-token-here
```
Restart server. Now uses real API!

### Console Logs
Open browser console (F12) to see:
```
✅ Loaded 2 shipments from database
✅ Warehouse saved to database: abc-123
✅ Shipment DL123456789 saved to database
🔧 Using mock mode (API not configured)
```

---

## 📊 What's Saved to Database

### Automatically Saved:
- ✅ Every shipment you create
- ✅ Every warehouse you create
- ✅ Every shipment cancellation
- ✅ Order-shipment links
- ✅ Pin code check history

### Refreshing Page:
- ✅ All data persists
- ✅ Shipments reload from database
- ✅ Nothing lost!

---

## 🔍 Verify in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Select **shipments** table
4. See all your shipments!
5. Select **warehouses** table
6. See all your warehouses!

---

## 🎯 Common Actions

### Cancel a Shipment
1. Go to **"Shipments"** tab
2. Click trash icon on any shipment
3. Confirm
4. ✅ Status updated to "cancelled" in DB!

### Generate Waybills
1. Go to **"Generate Waybills"** tab
2. Enter count (e.g., 5)
3. Click **"Generate Waybills"**
4. ✅ See 5 new waybills!

### Check Pin Code
1. Go to **"Pin Code Check"** tab
2. Enter pin code (e.g., 400001)
3. Click **"Check Serviceability"**
4. ✅ See serviceable areas!

---

## ❓ Troubleshooting

### Issue: No shipments showing
**Solution:** Run `shipping_database_setup.sql` first

### Issue: "Failed to load"
**Solution:** 
1. Check Supabase connection
2. Verify tables exist in Supabase
3. Check console for errors (F12)

### Issue: Can't access /admin/shipping
**Solution:** Make sure you're logged in as admin

---

## 📚 Full Documentation

- **Complete Guide:** `SHIPPING_DATABASE_ACTIVATION_COMPLETE.md`
- **Activation Guide:** `SHIPPING_ACTIVATION_GUIDE.md`
- **Status Overview:** `SHIPPING_STATUS.md`
- **Network Error Fix:** `NETWORK_ERROR_FIXED_SUMMARY.md`

---

## ✅ That's It!

You now have a **fully functional shipping module** with:
- ✅ Database persistence
- ✅ Order integration
- ✅ Mock mode for testing
- ✅ 9 specialized tabs
- ✅ Production-ready code

**Start shipping! 🚚💨**

---

*Quick Start Guide v1.0*  
*Setup time: ~5 minutes*

