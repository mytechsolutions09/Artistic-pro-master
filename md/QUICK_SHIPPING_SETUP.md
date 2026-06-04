# ⚡ Quick Shipping Setup (2 Minutes)

Follow these simple steps to activate your shipping module **right now**.

---

## Step 1: Set Up Database (1 minute)

### Option A: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to your Supabase project: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the SQL:**
   - Open `shipping_database_setup.sql` file in your project
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into Supabase SQL Editor
   - Click "Run" button (bottom right)
   - Wait for "Success" message

✅ **Done!** All 8 tables created.

---

## Step 2: Access Shipping Module (30 seconds)

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Login as admin**

3. **Go to Shipping:**
   - Click "Shipping" in the left sidebar, OR
   - Navigate to: `http://localhost:5173/admin/shipping`

✅ **Done!** Shipping module is now active!

---

## Step 3: Configure API (Optional - 30 seconds)

### For Mock Data Testing (Recommended First):
**Do nothing!** The system will automatically use mock data for testing.

You'll see this warning:
> "Delhivery API not configured. Using mock data for testing."

This is **completely normal** and lets you test everything without API credentials.

### For Real Delhivery Integration:

1. **Get your API token** from Delhivery dashboard

2. **Create `.env` file** in project root (if doesn't exist):
   ```bash
   # Copy from template
   cp env.template .env
   ```

3. **Add your token:**
   ```env
   VITE_DELHIVERY_API_TOKEN=your-actual-token-here
   ```

4. **Restart server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

✅ **Done!** Real API connected.

---

## What You Get

After setup, you'll have access to:

1. 📦 **Shipments** - View and manage all shipments
2. 📍 **Pin Code Check** - Check delivery serviceability  
3. 💰 **Rate Calculator** - Calculate shipping costs
4. ➕ **Create Shipment** - Create new shipments
5. 🏭 **Warehouse** - Manage pickup locations
6. ⚙️ **Advanced Shipment** - Advanced creation options
7. 📋 **Generate Waybills** - Bulk waybill generation
8. ⏱️ **Expected TAT** - Delivery time calculator
9. 🚛 **Request Pickup** - Schedule pickups

---

## Quick Test

1. Go to `/admin/shipping`
2. You should see 2 sample shipments:
   - DL123456789 - John Doe - Mumbai
   - DL987654321 - Jane Smith - Delhi
3. Click the "Pin Code Check" tab
4. Enter any pin code (e.g., `400001`)
5. See mock results!

---

## Troubleshooting

### ❌ Error: "relation 'shipments' does not exist"
**Fix:** Run the SQL script in Supabase (Step 1)

### ❌ Can't access /admin/shipping
**Fix:** Make sure you're logged in as an admin user

### ❌ Console errors
**Fix:** Check that Shipping.tsx exists and restart server

---

## Need More Details?

See **SHIPPING_ACTIVATION_GUIDE.md** for comprehensive documentation.

---

## That's It! 🎉

Your shipping module is now:
- ✅ Fully functional
- ✅ Database ready
- ✅ UI accessible
- ✅ Working with mock data

**Start testing now, add real API credentials later!**

