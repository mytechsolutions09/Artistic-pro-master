# Razorpay 400 Bad Request Error - Fix Guide

## Problem

You're getting a `400 Bad Request` error from Razorpay's standard checkout preferences API because:

1. **Using Live Keys with Mock Orders**: Your code uses `rzp_live_...` keys but creates mock order IDs instead of real Razorpay orders
2. **Missing Backend Integration**: Razorpay requires orders to be created through their API on the backend

## Solutions

### Solution 1: Use Test Keys (Recommended for Development)

**Step 1: Get Test Keys**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode** (toggle at top)
3. Go to Settings → API Keys
4. Generate Test Keys if you don't have them

**Step 2: Update `.env` file**
```env
# Use TEST keys for development
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
VITE_RAZORPAY_KEY_SECRET=your_test_secret_key

# Other settings
VITE_RAZORPAY_CURRENCY=INR
VITE_RAZORPAY_COMPANY_NAME=Lurevi
VITE_RAZORPAY_COMPANY_LOGO=https://lurevi.in/lurevi-logo.svg
VITE_RAZORPAY_THEME_COLOR=#0d9488
```

**Step 3: Restart your dev server**
```bash
npm run dev
```

**Benefits:**
- ✅ Works immediately
- ✅ No backend needed for testing
- ✅ Can test full payment flow
- ✅ No real money transactions
- ✅ Test cards available

### Solution 2: Create Proper Backend Integration (For Production)

For production with live keys, you MUST create orders on the backend.

#### Option A: Supabase Edge Function

**Step 1: Create Edge Function**
```bash
# Install Supabase CLI
npm install -g supabase

# Create edge function
supabase functions new create-razorpay-order
```

**Step 2: Implement the function** (`supabase/functions/create-razorpay-order/index.ts`):
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency, receipt } = await req.json()

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // in paise
        currency: currency,
        receipt: receipt,
      }),
    })

    const order = await response.json()
    
    return new Response(
      JSON.stringify(order),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

**Step 3: Deploy**
```bash
supabase functions deploy create-razorpay-order
```

**Step 4: Update `razorpayService.ts`** to call the edge function instead of creating mock orders.

#### Option B: Use Database Function (Quick Workaround)

**Step 1: Run the SQL script**
Run `create_razorpay_backend_function.sql` in Supabase SQL Editor.

**Step 2: Update `razorpayService.ts`**
```typescript
async createOrder(orderDetails: OrderDetails): Promise<string> {
  try {
    const amountInPaise = Math.round(orderDetails.amount * 100);
    
    // Call database function
    const { data, error } = await supabase.rpc('create_razorpay_order', {
      p_order_id: orderDetails.orderId,
      p_amount: orderDetails.amount,
      p_currency: orderDetails.currency || RAZORPAY_CURRENCY,
      p_customer_id: orderDetails.customerId,
      p_customer_email: orderDetails.customerEmail,
      p_customer_name: orderDetails.customerName,
      p_customer_phone: orderDetails.customerPhone
    });

    if (error) throw error;
    
    if (data && data.success) {
      return data.razorpay_order_id;
    } else {
      throw new Error(data?.error || 'Failed to create order');
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}
```

**Note:** This still uses mock order IDs and won't work with live keys in production.

### Solution 3: Quick Fix - Switch to Test Mode

**Immediate fix for testing:**

1. **Update `.env`** with test keys:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
   ```

2. **Restart dev server**

3. **Test with test cards:**
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

## Recommended Approach

### For Development/Testing
✅ **Use Test Keys** (Solution 1)
- Fastest to implement
- No backend needed
- Full testing capability

### For Production
✅ **Use Supabase Edge Functions** (Solution 2A)
- Secure
- Scalable
- Proper Razorpay integration

## Test Cards for Razorpay Test Mode

When using test keys, use these cards:

| Card Number | Type | Result |
|------------|------|--------|
| 4111 1111 1111 1111 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 4000 0000 0000 0002 | Visa | Declined |

**CVV:** Any 3 digits  
**Expiry:** Any future date  
**OTP:** 1234 (for test mode)

## Verify Your Setup

1. **Check your keys:**
   ```bash
   # In your terminal
   echo $VITE_RAZORPAY_KEY_ID
   ```

2. **Verify key type:**
   - Test keys: `rzp_test_XXXXX`
   - Live keys: `rzp_live_XXXXX`

3. **Check Razorpay Dashboard:**
   - Go to Settings → API Keys
   - Verify mode (Test/Live)
   - Check if keys are active

## Common Errors

### Error: "Invalid key_id"
- **Cause:** Wrong API key or key not active
- **Fix:** Regenerate keys in Razorpay dashboard

### Error: "Bad Request (400)"
- **Cause:** Using live keys with mock orders
- **Fix:** Switch to test keys OR implement proper backend

### Error: "Order ID mismatch"
- **Cause:** Frontend order ID doesn't match Razorpay order
- **Fix:** Ensure order is created via Razorpay API first

## Next Steps

1. ✅ **Immediate:** Switch to test keys for development
2. ✅ **Short-term:** Test full payment flow with test cards
3. ✅ **Long-term:** Implement Supabase Edge Function for production
4. ✅ **Before Launch:** Switch to live keys with proper backend

## Need Help?

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Razorpay Test Mode](https://razorpay.com/docs/payments/test-mode/)
