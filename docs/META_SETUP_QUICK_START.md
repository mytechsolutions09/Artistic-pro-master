# ⚡ Meta Business Manager - Quick Start

## 🎯 Setup Checklist for Lurevi.in

Your Meta Pixel (`1905415970060955`) is tracking - now complete Business Manager setup!

---

## ✅ Quick Action Plan

### **Step 1: Create Business Manager** (5 minutes)
```
1. Go to: https://business.facebook.com
2. Click "Create Account"
3. Enter: Lurevi (business name)
4. Verify email
✅ Done!
```

### **Step 2: Create Ad Account** (3 minutes)
```
1. Business Settings → Accounts → Ad Accounts
2. Click "Add" → "Create New Ad Account"
3. Set:
   • Currency: INR (₹) ⚠️ Cannot change later!
   • Time Zone: India Standard Time (GMT+5:30)
4. Click "Create"
✅ Done!
```

### **Step 3: Add Payment Method** (5 minutes)
```
1. Business Settings → Payments
2. Click "Add Payment Method"
3. Choose:
   • Credit/Debit Card, OR
   • UPI (India), OR
   • Net Banking
4. Complete verification
✅ Done!
```

### **Step 4: Verify Domain** (10 minutes)
```
🔥 MOST IMPORTANT FOR TRACKING!

1. Business Settings → Brand Safety → Domains
2. Click "Add" → Enter: lurevi.in
3. Choose "Meta Tag Verification"
4. Copy the meta tag
5. Add to your index.html (see below)
6. Deploy site
7. Click "Verify"
✅ Done!
```

### **Step 5: Connect Instagram** (3 minutes) - Optional
```
1. Business Settings → Accounts → Instagram Accounts
2. Click "Add"
3. Login to Instagram
4. Grant permissions
✅ Done!
```

---

## 🔥 Domain Verification - ADD THIS NOW

### Get Your Verification Code:
1. Go to Business Settings → Brand Safety → Domains
2. Add: lurevi.in
3. Choose: Meta Tag
4. Copy the code that looks like:
   ```html
   <meta name="facebook-domain-verification" content="xxxxx" />
   ```

### **Ready to Add It?**

**Just provide your verification code and I'll add it to your `index.html`!**

It will go in the `<head>` section with your other meta tags.

---

## 📊 Your Current Setup

| Item | Value | Status |
|------|-------|--------|
| **Pixel ID** | 1905415970060955 | ✅ Active |
| **Domain** | lurevi.in | ⏳ Needs verification |
| **Marketing Page** | /admin/marketing | ✅ Live |
| **Business Manager** | - | ⏳ To create |
| **Ad Account** | - | ⏳ To create |
| **Payment** | - | ⏳ To add |

---

## 🎯 Why Each Step Matters

### **Business Manager**
- Central hub for all Facebook marketing
- Required for ad accounts
- Manage team permissions

### **Ad Account (INR + IST)**
- Run campaigns
- ⚠️ Currency cannot be changed!
- Must set to INR from start

### **Payment Method**
- Required before ads can run
- Auto-charges when threshold reached
- Supports Indian payment methods

### **Domain Verification** 🔥
- **Critical for iOS 14+ tracking**
- Improves conversion accuracy
- Required for creative editing
- Enhances pixel data quality

### **Instagram Connection**
- Run Instagram ads
- Use Instagram placements
- Access Instagram insights

---

## 🚀 After Setup

Once complete, you can:

1. **Create Campaigns**
   - Traffic campaigns
   - Conversion campaigns
   - Awareness campaigns

2. **Build Audiences**
   - Website visitors
   - Cart abandoners
   - Past purchasers
   - Lookalike audiences

3. **Track Performance**
   - View in Events Manager
   - Monitor conversions
   - Optimize campaigns
   - Scale winners

---

## 📞 Quick Links

| Resource | URL |
|----------|-----|
| **Business Manager** | https://business.facebook.com |
| **Events Manager** | https://business.facebook.com/events_manager |
| **Your Marketing Admin** | /admin/marketing |
| **Full Setup Guide** | META_BUSINESS_MANAGER_SETUP.md |

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Business Manager | 5 min |
| Ad Account | 3 min |
| Payment Method | 5 min |
| Domain Verification | 10 min |
| Instagram (optional) | 3 min |
| **Total** | **~25 minutes** |

---

## 🎯 Priority Order

### **Do First (Required):**
1. ✅ Business Manager
2. ✅ Ad Account (INR, IST)
3. ✅ Payment Method
4. ✅ Domain Verification

### **Do Soon (Recommended):**
5. ✅ Instagram Connection
6. ✅ Test campaign (₹40-100)
7. ✅ Create audiences

### **Do Later (Optional):**
8. ✅ Conversions API
9. ✅ Catalog integration
10. ✅ Advanced matching

---

## 💡 Pro Tips

### Domain Verification:
- ✅ Use Meta Tag method (easiest!)
- ✅ Add tag before verifying
- ✅ Never remove verification tag
- ✅ Verify root domain (lurevi.in, not www.lurevi.in)

### Ad Account:
- ✅ Set INR currency (cannot change!)
- ✅ Set India time zone
- ✅ Add backup payment method
- ✅ Set billing threshold (optional)

### First Campaign:
- ✅ Start with ₹500-1,000/day
- ✅ Test for 3-7 days
- ✅ Track key metrics
- ✅ Scale winners

---

## 🔥 Domain Verification Template

When you get your verification code, your `index.html` will look like:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Meta Domain Verification -->
    <meta name="facebook-domain-verification" content="YOUR_CODE_HERE" />
    
    <!-- Meta Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1905415970060955');
      fbq('track', 'PageView');
    </script>
    
    <title>Luveri</title>
    <!-- Rest of head... -->
```

**Just give me your verification code and I'll add it!**

---

## ✅ Success Criteria

You're ready when:

- [x] Pixel tracking (done! ✅)
- [ ] Business Manager created
- [ ] Ad Account active (INR)
- [ ] Payment verified
- [ ] Domain verified
- [ ] Test campaign run
- [ ] Events showing in Events Manager

---

## 🚀 Ready to Start?

**Begin here:**
1. Go to https://business.facebook.com
2. Click "Create Account"
3. Follow the steps above!

**Need help?** Check `META_BUSINESS_MANAGER_SETUP.md` for detailed instructions!

**Domain verification code ready?** Share it and I'll add it to your site!

---

**Total Time:** ~25 minutes  
**Difficulty:** Easy  
**Priority:** High 🔥  
**Status:** Ready to start!

