# 🚚 Shipping Module Activation Guide

Your shipping section is fully built and ready to activate! Follow these steps to get it running.

## ✅ What's Already Built

1. **Complete Shipping Management UI** (`src/pages/admin/Shipping.tsx`)
   - Shipment tracking and management
   - Pin code serviceability checker
   - Shipping rate calculator
   - Create/edit shipments
   - Warehouse management
   - Advanced shipment creation
   - Waybill generation
   - Expected TAT calculator
   - Pickup request scheduling

2. **Delhivery API Integration** (`src/services/DelhiveryService.ts`)
   - Full API wrapper for Delhivery services
   - Support for 10+ different API endpoints
   - Mock data support for testing without API keys

3. **Navigation Components**
   - Integrated in admin sidebar
   - Secondary navigation with 9 shipping tabs
   - Fully routed at `/admin/shipping`

4. **Database Schema Ready** (`shipping_database_setup.sql`)
   - 8 database tables designed
   - Proper indexing and relationships
   - Sample data included

---

## 🚀 Activation Steps

### Step 1: Set Up Database Tables

Run the SQL script to create all necessary tables:

```bash
# Option 1: Using Supabase CLI (if installed)
supabase db reset

# Option 2: Via Supabase Dashboard
# 1. Go to your Supabase project dashboard
# 2. Click on "SQL Editor" in the left sidebar
# 3. Copy contents from shipping_database_setup.sql
# 4. Paste and click "Run"
```

**Tables that will be created:**
- `shipments` - Main shipment records
- `warehouses` - Warehouse/pickup locations
- `pin_code_checks` - Pin code serviceability cache
- `shipping_rates` - Rate calculation cache
- `pickup_requests` - Pickup scheduling
- `expected_tat` - Delivery time estimates cache
- `waybill_generation_log` - Waybill tracking
- `shipment_tracking_events` - Shipment event history

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# ===========================================
# DELHIVERY API CONFIGURATION
# ===========================================

# Get your API token from: https://www.delhivery.com/
VITE_DELHIVERY_API_TOKEN=your-actual-delhivery-api-token-here

# For TESTING - Use staging URLs (already in template)
VITE_DELHIVERY_BASE_URL=https://staging-express.delhivery.com
VITE_DELHIVERY_EXPRESS_URL=https://express-dev-test.delhivery.com
VITE_DELHIVERY_TRACK_URL=https://track.delhivery.com

# For PRODUCTION - Uncomment these when ready
# VITE_DELHIVERY_BASE_URL=https://express.delhivery.com
# VITE_DELHIVERY_EXPRESS_URL=https://express.delhivery.com
# VITE_DELHIVERY_TRACK_URL=https://track.delhivery.com

# API Settings
VITE_DELHIVERY_TIMEOUT=10000
VITE_DELHIVERY_RETRY_ATTEMPTS=3
```

### Step 3: Verify Access

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Log in as admin** and navigate to: `http://localhost:5173/admin/shipping`

3. **You should see 9 tabs:**
   - 📦 Shipments
   - 📍 Pin Code Check
   - 💰 Rate Calculator
   - ➕ Create Shipment
   - 🏭 Warehouse
   - ⚙️ Advanced Shipment
   - 📋 Generate Waybills
   - ⏱️ Expected TAT
   - 🚛 Request Pickup

---

## 🧪 Testing Without Delhivery Account

**Good News:** The system works with mock data if you don't have Delhivery API credentials yet!

If `VITE_DELHIVERY_API_TOKEN` is not configured or set to placeholder values, the system will:
- ✅ Show a warning notification
- ✅ Use mock/sample data for testing
- ✅ Let you test the entire UI and workflow
- ✅ Store data in your database (shipments, warehouses, etc.)

**To test without API:**
1. Leave `VITE_DELHIVERY_API_TOKEN` as is (or set to `test-token`)
2. Access `/admin/shipping`
3. System will show: "Delhivery API not configured. Using mock data for testing."
4. You can still:
   - View sample shipments
   - Create mock shipments
   - Test the UI and workflows
   - Check pin codes (will return mock data)

---

## 🔑 Getting Delhivery API Access

### For Production Use:

1. **Sign up for Delhivery:** https://www.delhivery.com/
2. **Complete business verification**
3. **Get API credentials** from your Delhivery dashboard
4. **Start with staging environment** to test
5. **Switch to production URLs** when ready

### API Access Tiers:
- **Staging/Test:** Free for testing, limited functionality
- **Production:** Requires business account and KYC verification

---

## 📊 Features Breakdown

### 1. Shipments Management
- View all shipments in a table
- Search by waybill, customer name, or phone
- Filter by status (pending, picked up, in transit, delivered, cancelled)
- Track pickup attempts and status
- View COD amounts
- Delete shipments

### 2. Pin Code Serviceability
- Check if delivery is available for any pin code
- View city, state, and hub information
- See available services (COD, Prepaid, Pickup, Reverse)
- Search history with caching

### 3. Rate Calculator
- Calculate shipping cost between two pin codes
- Input weight and COD amount
- Get breakdown of charges (freight, fuel surcharge, COD fee, etc.)
- View expected delivery time

### 4. Create Shipment
- Manual shipment creation form
- Import from existing orders
- Auto-fill customer details
- COD/Prepaid support
- Package dimensions

### 5. Warehouse Management
- Create and manage multiple warehouses
- Set pickup locations
- Configure return addresses
- Edit warehouse details

### 6. Advanced Shipment Creation
- Custom quality check items
- Multiple product types
- GST details
- Custom shipping modes
- Advanced options

### 7. Waybill Generation
- Generate multiple waybills at once
- Bulk waybill creation
- Track generated waybills

### 8. Expected TAT
- Calculate expected delivery dates
- Multiple transport modes (Surface, Air, Road)
- B2C and B2B support

### 9. Pickup Requests
- Schedule pickup from warehouse
- Set pickup date and time
- Track pickup status

---

## 🔍 Troubleshooting

### Issue: "Delhivery API not configured" warning

**Solution:** 
- This is normal if you haven't set up API credentials yet
- System will work with mock data
- To remove warning, add your `VITE_DELHIVERY_API_TOKEN` to `.env`

### Issue: Can't see shipping menu

**Checks:**
1. Are you logged in as admin?
2. Is the route `/admin/shipping` accessible?
3. Check browser console for errors
4. Verify `src/pages/admin/Shipping.tsx` exists

### Issue: Database errors when creating shipments

**Solution:**
- Run `shipping_database_setup.sql` in Supabase
- Check Supabase logs for specific errors
- Verify tables exist: Go to Table Editor in Supabase Dashboard

### Issue: Pin code check returns no results

**Possible causes:**
1. Using mock data (no API configured)
2. Invalid pin code format
3. API rate limit reached
4. Network/CORS issues

**Solutions:**
- Verify API token is correct
- Check network tab in browser DevTools
- Review CORS configuration in Delhivery dashboard

---

## 🎯 Next Steps After Activation

1. **Add Your Warehouses**
   - Go to Warehouse tab
   - Click "Create Warehouse"
   - Add your actual business address

2. **Test Pin Code Check**
   - Go to Pin Code Check tab
   - Enter your warehouse pin code
   - Verify it's serviceable

3. **Calculate Test Rates**
   - Use Rate Calculator
   - Try different pin codes
   - Understand pricing structure

4. **Create Test Shipment**
   - Create a test order first
   - Import it in shipping section
   - Generate waybill
   - Track shipment

5. **Schedule Test Pickup**
   - Go to Request Pickup tab
   - Schedule for tomorrow
   - Get confirmation

---

## 📱 Quick Access

- **Admin Dashboard:** `/admin`
- **Shipping Module:** `/admin/shipping`
- **Database Tables:** Supabase Dashboard → Table Editor
- **API Logs:** Browser DevTools → Network Tab

---

## 🆘 Support Resources

### Documentation Files in Your Project:
- `DELHIVERY_INTEGRATION.md` - Detailed API integration guide
- `DELHIVERY_CORS_FIX_GUIDE.md` - CORS troubleshooting
- `DELHIVERY_RETURNS_INTEGRATION.md` - Returns handling
- `shipping_database_setup.sql` - Database schema
- `shipping_functions.sql` - Database functions
- `shipping_queries.sql` - Useful queries

### External Resources:
- **Delhivery API Docs:** https://api.delhivery.com/docs
- **Delhivery Dashboard:** https://www.delhivery.com/
- **Support:** Contact Delhivery support for API issues

---

## ✅ Activation Checklist

- [ ] Database tables created (run SQL script)
- [ ] Environment variables configured (at minimum, set API token)
- [ ] Can access `/admin/shipping` as admin
- [ ] See 9 tabs in shipping section
- [ ] Can view sample shipments
- [ ] Warehouse tab accessible
- [ ] Pin code check works (mock or real data)
- [ ] Rate calculator works
- [ ] Can create test shipment
- [ ] No console errors

---

## 🎉 You're Ready!

Your shipping module is feature-complete and production-ready. The system is designed to work both with and without Delhivery API credentials, so you can start testing immediately!

**Start with mock data → Test workflows → Add real API credentials → Go live!**

---

*Last Updated: October 2024*
*Version: 1.0*

