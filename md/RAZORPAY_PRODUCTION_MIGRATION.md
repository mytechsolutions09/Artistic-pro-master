# Razorpay Production Migration Guide

## Current Setup Analysis

### What You Have Now (Test Mode)
- ✅ Test keys: `rzp_test_XXXXX`
- ✅ Mock order IDs generated in frontend
- ✅ Payment flow works for testing
- ✅ No backend order creation needed
- ✅ Test cards work perfectly

### What You Need for Production
- ❌ Live keys: `rzp_live_XXXXX`
- ❌ **Real order IDs** created via Razorpay API
- ❌ **Backend integration** (Edge Function or API)
- ❌ Payment signature verification on backend
- ❌ Webhook for payment status updates

## Problem with Current Code

Your current `razorpayService.ts` has:
```typescript
// Line 132-153: Creates MOCK order IDs
const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

**This works with TEST keys but NOT with LIVE keys.**

## Production Migration Options

### Option 1: Supabase Edge Function (RECOMMENDED)

Best for: Production-ready, scalable solution

#### Step 1: Create Edge Function

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Create edge function
supabase functions new create-razorpay-order
```

#### Step 2: Implement Edge Function

Create: `supabase/functions/create-razorpay-order/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Razorpay credentials from environment
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured')
    }

    // Parse request body
    const { amount, currency, receipt, notes } = await req.json()

    // Validate inputs
    if (!amount || !currency || !receipt) {
      throw new Error('Missing required fields: amount, currency, receipt')
    }

    // Create Basic Auth token
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    // Call Razorpay API to create order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: receipt,
        notes: notes || {}
      }),
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json()
      throw new Error(errorData.error?.description || 'Failed to create Razorpay order')
    }

    const order = await razorpayResponse.json()

    // Store order in Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient.from('razorpay_orders').insert({
      order_id: receipt,
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'created',
      created_at: new Date().toISOString()
    })

    // Return order details
    return new Response(
      JSON.stringify({
        success: true,
        order: order
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
```

#### Step 3: Deploy Edge Function

```bash
# Set environment variables
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_live_secret_key

# Deploy function
supabase functions deploy create-razorpay-order
```

#### Step 4: Update Frontend Code

Update `src/services/razorpayService.ts`:

```typescript
async createOrder(orderDetails: OrderDetails): Promise<string> {
  try {
    const amountInPaise = Math.round(orderDetails.amount * 100);
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount: orderDetails.amount,
        currency: orderDetails.currency || RAZORPAY_CURRENCY,
        receipt: orderDetails.orderId,
        notes: {
          customer_id: orderDetails.customerId,
          customer_email: orderDetails.customerEmail,
          customer_name: orderDetails.customerName
        }
      }
    });

    if (error) throw error;
    
    if (data && data.success) {
      return data.order.id; // Real Razorpay order ID
    } else {
      throw new Error(data?.error || 'Failed to create order');
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}
```

#### Step 5: Uncomment Order Creation

In `razorpayService.ts`, find line 230 and uncomment:

```typescript
// Line 230: Uncomment this
const razorpayOrderId = await this.createOrder(orderDetails);

// Line 248: Uncomment this
order_id: razorpayOrderId,
```

### Option 2: Netlify Function (Alternative)

If you're hosting on Netlify, you can use Netlify Functions.

#### Step 1: Create Netlify Function

Create: `netlify/functions/create-razorpay-order.ts`

```typescript
import { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { amount, currency, receipt, notes } = JSON.parse(event.body || '{}')

    // Get credentials from environment
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

    // Create Basic Auth
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')

    // Call Razorpay API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes
      }),
    })

    const order = await response.json()

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, order })
    }
  } catch (error: any) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    }
  }
}

export { handler }
```

#### Step 2: Update Frontend

```typescript
async createOrder(orderDetails: OrderDetails): Promise<string> {
  try {
    const response = await fetch('/.netlify/functions/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: orderDetails.amount,
        currency: orderDetails.currency || RAZORPAY_CURRENCY,
        receipt: orderDetails.orderId,
        notes: {
          customer_id: orderDetails.customerId,
          customer_email: orderDetails.customerEmail
        }
      })
    });

    const data = await response.json();
    
    if (data.success) {
      return data.order.id;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}
```

### Option 3: Keep Test Mode (NOT for Production)

If you want to stay in test mode for now:

**DO NOT switch to live keys until you implement Option 1 or 2**

Keep using:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXX
```

## Migration Checklist

### Pre-Migration
- [ ] Backup current `.env` file
- [ ] Document test key for reference
- [ ] Verify all test payments work
- [ ] Export test data if needed

### Backend Setup (Choose One)
- [ ] **Option 1:** Set up Supabase Edge Function
- [ ] **Option 2:** Set up Netlify Function
- [ ] **Option 3:** Set up custom backend API

### Code Changes
- [ ] Update `createOrder()` function
- [ ] Uncomment `order_id` in payment options
- [ ] Add error handling for order creation
- [ ] Test locally with test keys first

### Environment Variables
- [ ] Get live keys from Razorpay dashboard
- [ ] Set backend environment variables
- [ ] Update frontend `.env` (only key ID, NOT secret)
- [ ] Verify keys are correct format

### Testing
- [ ] Test with test keys + new backend
- [ ] Verify order creation works
- [ ] Test payment flow end-to-end
- [ ] Check database entries
- [ ] Test error scenarios

### Production Deployment
- [ ] Deploy backend function
- [ ] Update frontend environment variables
- [ ] Deploy frontend
- [ ] Test with live keys + small amount
- [ ] Monitor Razorpay dashboard
- [ ] Set up payment webhooks

### Post-Deployment
- [ ] Monitor first few transactions
- [ ] Check payment success rates
- [ ] Verify order status updates
- [ ] Set up alerts for failures
- [ ] Document any issues

## Environment Variables

### Frontend (.env)
```env
# Public - Safe to expose in frontend
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXX

# DO NOT include secret in frontend!
# VITE_RAZORPAY_KEY_SECRET should NOT be here
```

### Backend (Supabase Secrets / Netlify Env)
```env
# Private - Backend only
RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=your_live_secret_key
```

## Testing Strategy

### Phase 1: Local Development (Test Keys)
1. Use test keys
2. Test with test cards
3. Verify flow works

### Phase 2: Staging (Test Keys + Real Backend)
1. Deploy backend function
2. Keep using test keys
3. Test order creation via backend
4. Verify database storage

### Phase 3: Production Trial (Live Keys + Small Amount)
1. Switch to live keys
2. Test with ₹1 payment
3. Verify real payment works
4. Check Razorpay dashboard

### Phase 4: Full Production
1. Enable for all users
2. Monitor transactions
3. Set up alerts

## Security Checklist

- [ ] Never expose `RAZORPAY_KEY_SECRET` in frontend
- [ ] Always create orders on backend
- [ ] Verify payment signatures on backend
- [ ] Use HTTPS for all API calls
- [ ] Implement rate limiting
- [ ] Log all transactions
- [ ] Set up fraud detection
- [ ] Use webhooks for order status

## Common Issues

### Issue 1: 400 Error with Live Keys
**Cause:** Still using mock order IDs  
**Fix:** Implement backend order creation (Option 1 or 2)

### Issue 2: Order ID Mismatch
**Cause:** Frontend order ID doesn't match Razorpay  
**Fix:** Use order ID returned from Razorpay API

### Issue 3: Payment Not Verified
**Cause:** Signature verification failing  
**Fix:** Verify signature on backend using secret key

## Monitoring & Alerts

### Setup Razorpay Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `your-domain.com/api/razorpay-webhook`
3. Enable events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

### Database Monitoring

```sql
-- Check recent orders
SELECT * FROM razorpay_orders 
ORDER BY created_at DESC 
LIMIT 20;

-- Check payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM razorpay_orders
GROUP BY status;

-- Failed payments
SELECT * FROM razorpay_orders
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## Rollback Plan

If something goes wrong:

1. **Immediate:** Switch back to test keys
2. **Update environment variables**
3. **Deploy previous version**
4. **Investigate logs**
5. **Fix issues**
6. **Try again**

## Cost Estimates

### Razorpay Fees (India)
- **Domestic Cards:** 2% per transaction
- **International Cards:** 3% per transaction
- **UPI:** 2% per transaction
- **Net Banking:** 2% per transaction
- **Wallets:** 2% per transaction

### Example:
- Sale: ₹1000
- Fee: ₹20 (2%)
- You receive: ₹980

## Next Steps

**Recommended Path:**

1. **Week 1:** Implement Supabase Edge Function (Option 1)
2. **Week 2:** Test thoroughly with test keys
3. **Week 3:** Get live keys and test with ₹1
4. **Week 4:** Go live with monitoring

**Quick Path (If Urgent):**

1. **Today:** Set up Edge Function
2. **Tomorrow:** Test with test keys
3. **Day 3:** Switch to live keys
4. **Day 4:** Monitor closely

## Support Resources

- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Razorpay Integration Guide](https://razorpay.com/docs/payments/checkout/)
- [Payment Gateway Best Practices](https://razorpay.com/docs/payments/security/)

## Questions to Ask Yourself

Before going to production:

1. Do I have proper backend order creation?
2. Are payment signatures verified on backend?
3. Do I have webhooks set up?
4. Is error handling comprehensive?
5. Am I monitoring transactions?
6. Do I have a rollback plan?
7. Are secrets properly secured?

**If any answer is "No", don't switch to live keys yet!**

## Summary

| Feature | Test Mode (Current) | Production (Required) |
|---------|--------------------|-----------------------|
| Order Creation | Frontend (mock) | Backend (Razorpay API) |
| Keys | `rzp_test_XXX` | `rzp_live_XXX` |
| Backend | Not needed | **Required** |
| Signature Verification | Skipped | **Required** |
| Webhooks | Optional | **Recommended** |
| Real Money | No | Yes |

**Bottom Line:** You MUST implement backend order creation (Option 1 or 2) before using live keys.

