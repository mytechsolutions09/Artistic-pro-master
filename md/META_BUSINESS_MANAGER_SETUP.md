# 🎯 Meta Business Manager Setup Guide

## Complete Setup for Lurevi.in Facebook Ads

Your Meta Pixel (`1905415970060955`) is already tracking - now let's set up your Business Manager to run ads!

---

## 📋 Overview

This guide will help you:
1. ✅ Create Meta Business Manager
2. ✅ Set up Ad Account (INR, India timezone)
3. ✅ Connect Instagram business profile
4. ✅ Add payment methods
5. ✅ Verify domain (Lurevi.in)
6. ✅ Link your Meta Pixel

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Meta Business Manager**

#### 1.1 Navigate to Business Manager
```
URL: https://business.facebook.com
```

#### 1.2 Create Business Manager (if you don't have one)
1. Click **"Create Account"**
2. Enter business details:
   - **Business Name**: Lurevi (or your registered business name)
   - **Your Name**: [Your Name]
   - **Work Email**: [Your Business Email]
3. Click **"Submit"**
4. Verify your email address

#### 1.3 Add Business Details
1. Go to **Business Settings** (gear icon)
2. Click **Business Info**
3. Complete:
   - **Legal Business Name**: [Your registered name]
   - **Business Address**: [Your business address]
   - **Phone Number**: [Your business phone]
   - **Website**: https://lurevi.in
   - **Business Tax ID**: [Optional, for invoicing]

---

### **Step 2: Create Ad Account**

#### 2.1 Access Ad Accounts
1. In **Business Settings**, click **Accounts**
2. Click **Ad Accounts**
3. Click **"Add"** → **"Create a New Ad Account"**

#### 2.2 Configure Ad Account
1. **Ad Account Name**: Lurevi Ads (or your preference)
2. **Time Zone**: **(GMT+5:30) India Standard Time**
3. **Currency**: **INR (₹) - Indian Rupee**
   - ⚠️ **Important**: Cannot be changed later!
4. Click **"Next"**

#### 2.3 Assign Ad Account
1. Select your Business Manager
2. Click **"Assign"**

#### 2.4 Verify Ad Account
1. You'll see your new Ad Account listed
2. Note the **Ad Account ID** (format: act_XXXXXXXXXXXX)
3. Status should show **"Active"**

---

### **Step 3: Connect Instagram Business Profile**

#### 3.1 Prerequisites
✅ Have an Instagram account
✅ Convert to Business/Creator account (if personal)

#### 3.2 Add Instagram to Business Manager
1. In **Business Settings** → **Accounts**
2. Click **Instagram Accounts**
3. Click **"Add"**
4. Choose:
   - **"Add an Instagram account"** (if you own it)
   - **"Request access"** (if someone else owns it)

#### 3.3 Login to Instagram
1. Enter Instagram username
2. Enter Instagram password
3. Click **"Log In"**
4. Grant permissions

#### 3.4 Verify Connection
1. Your Instagram account should appear
2. Status: **"Connected"**
3. You can now use it in Facebook Ads

---

### **Step 4: Add Payment Method**

#### 4.1 Access Payments
1. **Business Settings** → **Payments**
2. Click **"Payment Settings"**
3. Click **"Add Payment Method"**

#### 4.2 Choose Payment Method

**Option A: Credit/Debit Card**
1. Select **"Credit or Debit Card"**
2. Enter card details:
   - Card number
   - Expiry date
   - CVV
   - Cardholder name
3. Billing address
4. Click **"Continue"**

**Option B: UPI (India)**
1. Select **"UPI"** (if available)
2. Enter UPI ID
3. Verify payment
4. Link to account

**Option C: Net Banking (India)**
1. Select bank
2. Complete authentication
3. Set up auto-debit

#### 4.3 Set Payment Threshold (Optional)
1. **Manual payments**: Pay before ads run
2. **Automatic payments**: Set billing threshold
   - Example: ₹1,000 threshold
   - Charges when you spend ₹1,000 or monthly

#### 4.4 Verify Payment Method
1. Meta may charge ₹1-2 for verification
2. Amount will be refunded
3. Status: **"Verified"**

---

### **Step 5: Verify Your Domain (Lurevi.in)**

⚠️ **Critical for**:
- Conversion tracking accuracy
- iOS 14+ tracking
- Creative editing
- Pixel optimization

#### 5.1 Access Domain Verification
1. **Business Settings** → **Brand Safety**
2. Click **"Domains"**
3. Click **"Add"**

#### 5.2 Enter Your Domain
```
Domain: lurevi.in
```
- ✅ Enter without www
- ✅ Without http:// or https://

#### 5.3 Choose Verification Method

**Method 1: Meta Tag (Recommended - Easiest)**

1. Select **"Meta Tag Verification"**
2. Copy the meta tag provided:
   ```html
   <meta name="facebook-domain-verification" content="xxxxxxxxxx" />
   ```
3. Add to your `index.html` in the `<head>` section
4. Deploy your site
5. Come back and click **"Verify"**

**Method 2: DNS Verification**

1. Select **"DNS Verification"**
2. Copy the TXT record:
   ```
   Type: TXT
   Name: @
   Value: facebook-domain-verification=xxxxxxxxxx
   ```
3. Add to your domain DNS settings (Hostinger, GoDaddy, etc.)
4. Wait 24-72 hours for DNS propagation
5. Come back and click **"Verify"**

**Method 3: HTML File Upload**

1. Select **"HTML File Upload"**
2. Download the HTML file
3. Upload to your website root
4. Make accessible at: `https://lurevi.in/[filename].html`
5. Come back and click **"Verify"**

#### 5.4 Verify Domain
1. Click **"Verify"**
2. Wait for verification (instant for meta tag, up to 72 hours for DNS)
3. Status should change to **"Verified"** ✅

---

### **Step 6: Link Your Meta Pixel**

#### 6.1 Access Pixels
1. **Business Settings** → **Data Sources**
2. Click **"Pixels"**
3. Find your Pixel: `1905415970060955`

#### 6.2 Assign Pixel to Business Manager
1. Click **"Add"**
2. Choose **"Add Existing Pixel"**
3. Enter Pixel ID: `1905415970060955`
4. Click **"Add Pixel"**

#### 6.3 Verify Pixel in Business Manager
1. Your pixel should appear in the list
2. Status: **"Active"**
3. Events: Should show recent activity

---

## ✅ Verification Checklist

After completing all steps:

### Business Manager:
- [ ] Business Manager created
- [ ] Business details complete
- [ ] Email verified

### Ad Account:
- [ ] Ad Account created
- [ ] Currency: INR (₹)
- [ ] Time Zone: India (GMT+5:30)
- [ ] Status: Active
- [ ] Ad Account ID noted

### Instagram:
- [ ] Instagram account connected
- [ ] Appears in Business Settings
- [ ] Status: Connected

### Payment:
- [ ] Payment method added
- [ ] Payment method verified
- [ ] Billing threshold set (optional)

### Domain:
- [ ] lurevi.in added
- [ ] Verification method chosen
- [ ] Domain verified ✅
- [ ] Status: Verified

### Pixel:
- [ ] Pixel linked to Business Manager
- [ ] Pixel ID: 1905415970060955
- [ ] Status: Active
- [ ] Events tracking

---

## 🔧 Implementation: Domain Verification

### Add Meta Tag to Your Site

I'll help you add the verification meta tag to your `index.html`:

1. **Get your verification code** from Meta Business Settings
2. **Open** `index.html`
3. **Add** in the `<head>` section:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Meta Domain Verification -->
    <meta name="facebook-domain-verification" content="YOUR_VERIFICATION_CODE" />
    
    <title>Luveri</title>
    <!-- Rest of head... -->
```

**Would you like me to add this for you?** Just provide your verification code!

---

## 📊 Post-Setup Tasks

### 1. **Test Your Pixel**
```
Go to: /admin/marketing
Click: "Test Pixel"
Check: Meta Events Manager for event
```

### 2. **Create Custom Audiences**
1. Go to **Ads Manager** → **Audiences**
2. Create:
   - Website visitors (all)
   - Product viewers
   - Cart abandoners
   - Purchasers

### 3. **Set Up Conversions API (Optional)**
- Server-side tracking
- More accurate data
- iOS 14+ compliance
- Better attribution

### 4. **Install Pixel Helper**
```
Chrome Extension: Meta Pixel Helper
Verify: Pixel fires on all pages
Check: No errors or warnings
```

---

## 🎯 Campaign Creation Checklist

Before creating your first campaign:

### Assets Ready:
- [ ] Business Manager set up
- [ ] Ad Account active
- [ ] Pixel tracking
- [ ] Domain verified
- [ ] Payment method added
- [ ] Instagram connected (optional)

### Creative Assets:
- [ ] Product images (1080x1080 recommended)
- [ ] Ad copy prepared
- [ ] Landing pages optimized
- [ ] Call-to-action decided

### Targeting:
- [ ] Audience defined
- [ ] Location: India (or specific states/cities)
- [ ] Age range determined
- [ ] Interests identified

### Budget:
- [ ] Daily budget decided (min ₹40/day)
- [ ] Campaign duration planned
- [ ] Bid strategy selected

---

## 💡 Best Practices

### Domain Verification:
✅ **DO:**
- Use meta tag method (easiest)
- Verify as soon as possible
- Keep verification in place always

❌ **DON'T:**
- Remove verification tag after verifying
- Use subdomains (verify root domain)
- Delay verification

### Ad Account Setup:
✅ **DO:**
- Choose INR currency from start
- Use correct time zone (IST)
- Add backup payment method

❌ **DON'T:**
- Create multiple ad accounts without reason
- Share ad account access publicly
- Use personal card for business ads

### Pixel Setup:
✅ **DO:**
- Keep pixel active always
- Track all key events
- Check Events Manager regularly

❌ **DON'T:**
- Install multiple pixels
- Remove pixel code
- Ignore pixel errors

---

## 🚨 Common Issues & Solutions

### Issue 1: "Domain Not Verified"
**Solutions:**
1. Check meta tag is in `<head>` section
2. Deploy site and wait 5-10 minutes
3. Try DNS verification instead
4. Check domain spelling (no www)

### Issue 2: "Payment Method Declined"
**Solutions:**
1. Verify card details correct
2. Check card has international payments enabled
3. Try different payment method
4. Contact your bank
5. Use UPI or Net Banking (India)

### Issue 3: "Pixel Not Receiving Events"
**Solutions:**
1. Check pixel code in `index.html`
2. Verify Pixel ID is correct
3. Use Pixel Helper to debug
4. Check browser console for errors
5. Test with `/admin/marketing` → "Test Pixel"

### Issue 4: "Can't Create Ad Account"
**Solutions:**
1. Complete Business Manager setup
2. Verify email address
3. Add business information
4. Wait 24 hours after Business Manager creation
5. Contact Meta support

---

## 📞 Support Resources

### Meta Resources:
| Resource | URL |
|----------|-----|
| **Business Manager** | https://business.facebook.com |
| **Events Manager** | https://business.facebook.com/events_manager |
| **Ads Manager** | https://business.facebook.com/adsmanager |
| **Help Center** | https://www.facebook.com/business/help |
| **Meta Blueprint** | https://www.facebook.com/business/learn |

### Your Resources:
| Resource | Location |
|----------|----------|
| **Marketing Admin** | `/admin/marketing` |
| **Pixel ID** | `1905415970060955` |
| **Domain** | `lurevi.in` |
| **Pixel Docs** | `YOUR_PIXEL_IS_READY.md` |
| **Setup Guide** | `MARKETING_ADMIN_SETUP.md` |

---

## 🎓 Learning Resources

### Recommended Courses:
1. **Meta Blueprint** - Free official training
2. **Facebook Ads Manager Guide** - Official documentation
3. **Pixel Setup Guide** - Meta developers docs

### Key Topics to Learn:
- Campaign objectives
- Audience targeting
- Ad creative best practices
- Bidding strategies
- Budget optimization
- Conversion tracking
- Reporting and analytics

---

## 🎯 Next Steps

### Immediate (Today):
1. ✅ Create Business Manager
2. ✅ Set up Ad Account (INR, IST)
3. ✅ Add payment method
4. ✅ Start domain verification

### This Week:
1. ✅ Complete domain verification
2. ✅ Link Instagram (if using)
3. ✅ Create first custom audience
4. ✅ Plan first campaign

### This Month:
1. ✅ Launch first campaign
2. ✅ Monitor pixel events
3. ✅ Optimize based on data
4. ✅ Scale successful campaigns

---

## 💰 Budget Guidelines

### Minimum Budgets (India):
- **Daily**: ₹40/day minimum
- **Lifetime**: ₹280/week minimum
- **Recommended Starting**: ₹500-1,000/day for testing

### Campaign Types:
| Objective | Min Daily Budget | Recommended |
|-----------|------------------|-------------|
| **Awareness** | ₹40 | ₹500-1,000 |
| **Traffic** | ₹40 | ₹300-800 |
| **Engagement** | ₹40 | ₹300-600 |
| **Conversions** | ₹160 | ₹1,000-3,000 |

---

## ✅ Setup Complete Checklist

Use this to track your progress:

### Phase 1: Foundation
- [ ] Business Manager created
- [ ] Business details complete
- [ ] Email verified

### Phase 2: Ad Account
- [ ] Ad Account created
- [ ] Currency: INR set
- [ ] Time zone: IST set
- [ ] Payment method added & verified

### Phase 3: Assets
- [ ] Instagram connected (optional)
- [ ] Domain verification started
- [ ] Domain verified ✅
- [ ] Pixel linked

### Phase 4: Ready to Launch
- [ ] Test ad account (spend ₹1)
- [ ] Pixel tracking verified
- [ ] Custom audience created
- [ ] First campaign planned

---

## 🎉 You're Ready!

Once all steps are complete, you'll have:

✅ **Business Manager** set up and configured  
✅ **Ad Account** ready with INR currency  
✅ **Payment Method** verified and active  
✅ **Domain** verified for tracking  
✅ **Pixel** tracking conversions  
✅ **Instagram** connected (optional)  

**You can now create and run Facebook Ads for Lurevi!**

---

## 📋 Quick Reference Card

```
Business Manager: https://business.facebook.com
Ad Account Currency: INR (₹)
Time Zone: India Standard Time (GMT+5:30)
Domain: lurevi.in
Pixel ID: 1905415970060955
Marketing Admin: /admin/marketing
```

---

**Need help with any step?** Check the troubleshooting section or Meta's Help Center!

**Ready to advertise?** Follow this guide step-by-step and you'll be running ads in no time! 🚀

---

**Document**: Meta Business Manager Setup  
**For**: Lurevi.in  
**Pixel ID**: 1905415970060955  
**Status**: Ready to implement

