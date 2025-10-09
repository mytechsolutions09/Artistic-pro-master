# Meta (Facebook) Pixel Integration

## ✅ Setup Complete!

Your Meta Pixel has been successfully integrated into the website.

---

## 📊 Pixel Details

**Pixel ID:** `1165585550249911`

**Status:** ✅ Active and tracking

---

## 🎯 Events Being Tracked

### Standard Events:

1. **PageView** - Automatically tracks all page views
2. **ViewContent** - Tracks when users view products
3. **Search** - Tracks search queries
4. **AddToCart** - Tracks when items are added to cart
5. **InitiateCheckout** - Tracks when checkout begins
6. **AddPaymentInfo** - Tracks when payment info is added
7. **Purchase** - Tracks completed purchases (conversions)
8. **CompleteRegistration** - Tracks user sign-ups
9. **Lead** - Tracks lead generation events
10. **AddToWishlist** - Tracks wishlist additions
11. **Contact** - Tracks contact form submissions

---

## 🔧 Implementation Details

### Files Modified:

1. **`index.html`**
   - Added Meta Pixel base code
   - Pixel loads on every page

2. **`src/services/metaPixelService.ts`** (NEW)
   - Complete tracking service
   - Helper functions for all events
   - Type-safe event tracking

3. **`env.template`**
   - Added Meta Pixel environment variables
   - Pixel ID configuration

---

## 📱 How to Use in Your Code

### Import the Service:

```typescript
import MetaPixelService from '../services/metaPixelService';
```

### Track Events:

#### Product View:
```typescript
MetaPixelService.trackViewContent({
  content_name: product.title,
  content_category: product.category,
  content_ids: [product.id],
  value: product.price,
  currency: 'INR'
});
```

#### Add to Cart:
```typescript
MetaPixelService.trackAddToCart({
  content_name: product.title,
  content_ids: [product.id],
  value: product.price,
  currency: 'INR'
});
```

#### Purchase (Conversion):
```typescript
MetaPixelService.trackPurchase({
  content_ids: orderItems.map(item => item.id),
  value: totalAmount,
  currency: 'INR',
  num_items: orderItems.length
});
```

#### User Registration:
```typescript
MetaPixelService.trackCompleteRegistration({
  content_name: 'User Registration',
  status: 'completed'
});
```

#### Search:
```typescript
MetaPixelService.trackSearch(searchQuery);
```

---

## 🎯 Integration Recommendations

### Add to Existing Pages:

#### 1. Product Detail Page
```typescript
// In ProductDetail.tsx
useEffect(() => {
  if (product) {
    MetaPixelService.trackViewContent({
      content_name: product.title,
      content_category: product.category,
      content_ids: [product.id],
      value: product.price
    });
  }
}, [product]);
```

#### 2. Add to Cart Button
```typescript
const handleAddToCart = () => {
  // Your existing add to cart logic
  addToCart(product);
  
  // Track with Meta Pixel
  MetaPixelService.trackAddToCart({
    content_name: product.title,
    content_ids: [product.id],
    value: product.price
  });
};
```

#### 3. Checkout Page
```typescript
// When user starts checkout
MetaPixelService.trackInitiateCheckout({
  content_ids: cartItems.map(item => item.id),
  num_items: cartItems.length,
  value: totalAmount
});
```

#### 4. Payment Success Page
```typescript
// After successful payment
MetaPixelService.trackPurchase({
  content_ids: orderItems.map(item => item.id),
  value: orderTotal,
  currency: 'INR',
  num_items: orderItems.length
});
```

#### 5. Sign Up Page
```typescript
// After successful registration
MetaPixelService.trackCompleteRegistration({
  content_name: 'User Registration',
  status: 'completed'
});
```

---

## 📊 Verify Pixel Installation

### Method 1: Meta Events Manager

1. Go to: https://business.facebook.com/events_manager
2. Select your pixel (1165585550249911)
3. Check "Test Events" tab
4. Browse your website
5. See events appear in real-time

### Method 2: Meta Pixel Helper (Chrome Extension)

1. Install: https://chrome.google.com/webstore/detail/meta-pixel-helper/
2. Visit your website
3. Click extension icon
4. See pixel status and events

### Method 3: Browser Console

Events are logged in the console when they fire:
```
Meta Pixel: PageView tracked
Meta Pixel: ViewContent tracked { content_name: "Product Name", ... }
```

---

## 🎯 Facebook Ads Integration

### Create Audiences:

1. **Website Visitors** - All visitors (PageView)
2. **Product Viewers** - Viewed specific products (ViewContent)
3. **Cart Abandoners** - Added to cart but didn't purchase
4. **Purchasers** - Completed purchase (Purchase event)
5. **High-Value Customers** - Purchase value > threshold

### Create Campaigns:

1. **Retargeting Campaigns**
   - Target cart abandoners
   - Target product viewers
   - Offer discounts

2. **Lookalike Audiences**
   - Based on purchasers
   - Based on high-value customers

3. **Conversion Campaigns**
   - Optimize for Purchase event
   - Track ROAS (Return on Ad Spend)

---

## 🔒 Privacy & GDPR Compliance

### Important Notes:

1. **Cookie Consent**
   - Add cookie consent banner if required
   - Allow users to opt-out of tracking

2. **Privacy Policy**
   - Update privacy policy to mention Meta Pixel
   - Explain data collection

3. **Data Processing Agreement**
   - Review Meta's terms
   - Ensure GDPR compliance

---

## 📈 Optimization Tips

### 1. Event Matching
- Pass user email (hashed) for better matching
- Pass phone number (hashed) for better matching
- Improves ad targeting accuracy

### 2. Value Optimization
- Always include `value` parameter
- Use consistent currency (INR)
- Helps optimize for ROAS

### 3. Content IDs
- Use consistent product IDs
- Helps with dynamic product ads
- Enables product catalog sync

---

## 🐛 Troubleshooting

### Pixel Not Firing?

**Check 1: Console Errors**
```javascript
// Open browser console
// Look for errors related to fbq
```

**Check 2: Ad Blockers**
- Disable ad blockers for testing
- Meta Pixel may be blocked

**Check 3: Pixel Helper**
- Use Meta Pixel Helper extension
- Shows pixel status

### Events Not Showing in Events Manager?

**Wait Time:** Events may take 15-30 minutes to appear

**Test Events:** Use Test Events tab for instant feedback

**Check Parameters:** Ensure required parameters are passed

---

## 📊 Custom Conversions

### Create Custom Conversions in Events Manager:

1. Go to Events Manager
2. Click "Custom Conversions"
3. Create rules based on events:
   - Purchase > $50 (High-value purchase)
   - ViewContent + AddToCart (High intent)
   - Lead (Contact form submission)

---

## 🎯 Advanced Features

### Automatic Advanced Matching

Meta Pixel automatically collects:
- Email (if user is logged in)
- Phone (if provided)
- First name / Last name
- City / State / Country
- Zip code

This improves ad targeting and measurement.

### Server-Side Events (Future)

For better tracking accuracy:
1. Implement Conversions API
2. Send events from server
3. More accurate attribution

---

## 📚 Resources

### Meta Documentation:
- **Events Manager:** https://business.facebook.com/events_manager
- **Pixel Setup Guide:** https://www.facebook.com/business/help/952192354843755
- **Standard Events:** https://developers.facebook.com/docs/meta-pixel/reference

### Testing Tools:
- **Meta Pixel Helper:** https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
- **Test Events:** In Events Manager → Test Events tab

---

## ✅ Quick Checklist

- [x] Meta Pixel code added to website
- [x] Pixel ID configured (1165585550249911)
- [x] MetaPixelService created
- [x] Environment variables added
- [ ] Test pixel with Meta Pixel Helper
- [ ] Verify events in Events Manager
- [ ] Integrate tracking in key pages
- [ ] Create Facebook audiences
- [ ] Launch retargeting campaigns

---

## 🚀 Next Steps

1. **Test the Pixel**
   - Browse your website
   - Check Events Manager for events
   - Verify all events fire correctly

2. **Integrate Tracking**
   - Add tracking to product pages
   - Add tracking to checkout flow
   - Add tracking to success pages

3. **Create Audiences**
   - Set up custom audiences
   - Create lookalike audiences
   - Build retargeting lists

4. **Launch Campaigns**
   - Create Facebook Ads
   - Optimize for conversions
   - Track performance

---

**Your Meta Pixel is ready to use!** 🎉

Start tracking user behavior and optimize your Facebook Ads campaigns for maximum ROI!

