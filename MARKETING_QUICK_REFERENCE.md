# 🚀 Marketing Admin - Quick Reference

## 🎯 Quick Access
```
Admin Panel → Settings → Marketing Tab (TrendingUp icon)
```

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Database Setup
```sql
-- Run in Supabase SQL Editor:
-- File: create_marketing_settings_table.sql
```

### Step 2: Configure Pixel
1. Go to **Admin → Settings → Marketing**
2. Enter your **Meta Pixel ID** (16 digits)
3. Toggle **"Enable Meta Pixel"** to **ON**
4. Click **"Save Marketing Settings"**

### Step 3: Test
1. Click **"Test Pixel"** button
2. Check **Meta Events Manager**
3. Verify status shows **"Active"** (green badge)

---

## 📊 Marketing Settings Interface

### Controls

| Element | Purpose | Action |
|---------|---------|--------|
| **Meta Pixel ID** | Configure pixel | Enter 16-digit ID |
| **Enable Toggle** | Turn on/off | Switch on/off |
| **Test Pixel** | Send test event | Click to test |
| **Copy Button** | Copy Pixel ID | Click to copy |
| **Events Manager** | View events | Opens Meta dashboard |
| **Save Button** | Save settings | Saves to database |

### Status Indicators

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Active | Pixel is working |
| 🔴 Red | Inactive | Pixel not loaded |
| ⚫ Gray | Checking... | Status check in progress |

---

## 🎯 Meta Pixel Events

### Automatic Events
```
✅ PageView - All pages
✅ ViewContent - Product views
✅ AddToCart - Cart additions
✅ InitiateCheckout - Checkout starts
✅ Purchase - Completed orders
✅ CompleteRegistration - User signups
✅ AddToWishlist - Favorites
✅ Contact - Contact forms
✅ Search - Search queries
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Events Manager** | https://business.facebook.com/events_manager |
| **Pixel Docs** | https://developers.facebook.com/docs/meta-pixel |
| **Pixel Helper** | https://chrome.google.com/webstore (search: Meta Pixel Helper) |
| **Setup Guide** | https://www.facebook.com/business/help/952192354843755 |

---

## 🐛 Quick Troubleshooting

### Pixel shows "Inactive"?
```
1. Refresh the page
2. Check Pixel ID is correct
3. Disable ad blockers
4. Clear browser cache
```

### Can't save settings?
```
1. Run database setup script
2. Check you're logged in as admin
3. Verify Supabase connection
4. Check browser console
```

### Test event not showing?
```
1. Wait 1-2 minutes
2. Check "Test Events" tab
3. Use Meta Pixel Helper
4. Check console for errors
```

---

## 📋 Database Commands

### Check if table exists:
```sql
SELECT * FROM marketing_settings;
```

### View current settings:
```sql
SELECT meta_pixel_id, meta_pixel_enabled, updated_at 
FROM marketing_settings;
```

### Update Pixel ID manually:
```sql
UPDATE marketing_settings 
SET meta_pixel_id = 'YOUR_PIXEL_ID' 
WHERE id = (SELECT id FROM marketing_settings LIMIT 1);
```

### Reset to defaults:
```sql
DELETE FROM marketing_settings;
-- Then re-run create_marketing_settings_table.sql
```

---

## 💻 API Usage

### Check if pixel is loaded:
```typescript
import MetaPixelService from '@/services/metaPixelService';

const isLoaded = MetaPixelService.isLoaded();
console.log('Pixel loaded:', isLoaded); // true/false
```

### Set Pixel ID dynamically:
```typescript
MetaPixelService.setPixelId('1234567890123456');
```

### Track custom event:
```typescript
MetaPixelService.trackCustomEvent('MyCustomEvent', {
  param1: 'value1',
  param2: 'value2'
});
```

### Get current Pixel ID:
```typescript
const pixelId = MetaPixelService.getPixelId();
console.log('Current Pixel ID:', pixelId);
```

---

## 📂 File Locations

```
📁 Marketing Admin Files:
│
├── 📄 src/components/admin/settings/MarketingSettings.tsx
│   └── Main UI component
│
├── 📄 src/services/metaPixelService.ts
│   └── Pixel tracking service
│
├── 📄 create_marketing_settings_table.sql
│   └── Database setup
│
└── 📄 MARKETING_ADMIN_SETUP.md
    └── Full documentation
```

---

## ⚙️ Environment Variables

```env
# In .env file:
VITE_META_PIXEL_ID=1165585550249911
VITE_ENABLE_META_PIXEL=true
```

---

## 🎨 UI Components

### Success Message
```
✅ Green background
✅ Check icon
✅ "Settings saved successfully!"
```

### Error Message
```
❌ Red background
❌ Alert icon
❌ Error description
```

### Loading State
```
🔄 Spinning animation
🔄 "Saving..." text
🔄 Disabled button
```

---

## 🔐 Security

### Read Access (Public)
```
✅ Frontend can read settings
✅ Pixel can be loaded on site
```

### Write Access (Admin Only)
```
🔒 Only authenticated users
🔒 Only admin panel access
🔒 Protected by RLS policies
```

---

## 📊 Metrics to Track

### Key Performance Indicators (KPIs)

1. **Traffic Metrics**
   - PageViews
   - Unique visitors
   - Session duration

2. **Engagement Metrics**
   - Product views
   - Search queries
   - Wishlist additions

3. **Conversion Metrics**
   - Add to cart rate
   - Checkout initiation rate
   - Purchase completion rate
   - Average order value

4. **Marketing Metrics**
   - ROAS (Return on Ad Spend)
   - CPA (Cost per Acquisition)
   - CTR (Click-through Rate)
   - Conversion Rate

---

## 🎯 Campaign Ideas

### 1. Cart Abandonment
```
Target: Users who added to cart but didn't purchase
Action: Show discount or free shipping offer
Timeline: 1-24 hours after abandonment
```

### 2. Product Retargeting
```
Target: Users who viewed specific products
Action: Show those products in ads
Timeline: 1-7 days after view
```

### 3. Lookalike Audiences
```
Target: Similar to past purchasers
Action: Reach new potential customers
Timeline: Ongoing campaign
```

### 4. Cross-sell/Upsell
```
Target: Past purchasers
Action: Show complementary products
Timeline: 7-30 days after purchase
```

---

## ✅ Pre-Launch Checklist

Before going live with marketing campaigns:

- [ ] Database table created
- [ ] Pixel ID configured
- [ ] Pixel status shows "Active"
- [ ] Test event sent successfully
- [ ] All key events tested
- [ ] Privacy Policy updated
- [ ] Cookie consent added (if required)
- [ ] Facebook Business account set up
- [ ] Ads account verified
- [ ] Payment method added
- [ ] First campaign created
- [ ] Budget set appropriately

---

## 🚦 Status Check Commands

### Quick Health Check
```typescript
// In browser console:
console.log('Pixel loaded:', typeof fbq !== 'undefined');
console.log('Pixel ID:', fbq ? fbq.getState() : 'Not loaded');
```

### Full Diagnostic
```typescript
// Check all components:
1. Database: SELECT * FROM marketing_settings;
2. Frontend: MetaPixelService.isLoaded()
3. Console: Look for "Meta Pixel: PageView tracked"
4. Network: Check calls to facebook.com
5. Extension: Meta Pixel Helper shows green checkmark
```

---

## 📞 Support Resources

### Documentation
- [Full Setup Guide](MARKETING_ADMIN_SETUP.md)
- [Meta Pixel Setup](META_PIXEL_SETUP.md)
- [Environment Variables](env.template)

### External Help
- Meta Business Help Center
- Facebook Developer Docs
- Meta Pixel Helper Extension
- Meta Events Manager

---

## 🎉 Quick Wins

### Immediate Actions (Today)
1. Set up database table (5 min)
2. Configure Pixel ID (2 min)
3. Test pixel (1 min)
4. Verify in Events Manager (2 min)

### Short-term Goals (This Week)
1. Monitor event data
2. Create first custom audience
3. Set up conversion tracking
4. Plan first campaign

### Long-term Goals (This Month)
1. Launch retargeting campaigns
2. Create lookalike audiences
3. Optimize ad spend
4. Scale successful campaigns

---

**Need Help?** 
Check [MARKETING_ADMIN_SETUP.md](MARKETING_ADMIN_SETUP.md) for detailed instructions!

🚀 **Happy Marketing!**

