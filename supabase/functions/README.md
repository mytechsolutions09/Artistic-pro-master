# Supabase Edge Functions for Razorpay

This directory contains Edge Functions for secure Razorpay payment processing.

## Functions

### 1. create-razorpay-order
Creates a new Razorpay order via the Razorpay API.

**Endpoint:** `/functions/v1/create-razorpay-order`

**Method:** POST

**Request Body:**
```json
{
  "amount": 320,
  "currency": "INR",
  "receipt": "order_123456",
  "notes": {
    "customer_id": "user_123",
    "customer_email": "user@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_MhVxKJZwvXXXXX",
    "amount": 32000,
    "currency": "INR",
    "receipt": "order_123456",
    "status": "created"
  }
}
```

### 2. verify-razorpay-payment
Verifies payment signature after successful payment.

**Endpoint:** `/functions/v1/verify-razorpay-payment`

**Method:** POST

**Request Body:**
```json
{
  "razorpay_order_id": "order_MhVxKJZwvXXXXX",
  "razorpay_payment_id": "pay_MhVxKJZwvXXXXX",
  "razorpay_signature": "abc123...",
  "order_id": "order_123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "payment_id": "pay_MhVxKJZwvXXXXX",
  "order_id": "order_MhVxKJZwvXXXXX"
}
```

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

Find your project ref in: `https://app.supabase.com/project/[your-project-ref]`

### 4. Set Environment Variables

```bash
# Set Razorpay credentials
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_live_secret_key

# Supabase credentials are automatically available:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
```

### 5. Deploy Functions

Deploy both functions:

```bash
# Deploy create order function
supabase functions deploy create-razorpay-order

# Deploy verify payment function
supabase functions deploy verify-razorpay-payment
```

Or deploy all functions:

```bash
supabase functions deploy
```

## Testing

### Test create-razorpay-order

```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/create-razorpay-order \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "INR",
    "receipt": "test_order_123"
  }'
```

### Test verify-razorpay-payment

```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/verify-razorpay-payment \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_XXXXX",
    "razorpay_payment_id": "pay_XXXXX",
    "razorpay_signature": "signature_XXXXX",
    "order_id": "test_order_123"
  }'
```

## Local Development

### Run Functions Locally

```bash
# Serve all functions locally
supabase functions serve

# Serve specific function
supabase functions serve create-razorpay-order
```

### Set Local Environment Variables

Create `.env.local` file:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXX
RAZORPAY_KEY_SECRET=your_test_secret_key
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Monitoring

### View Function Logs

```bash
# View logs for specific function
supabase functions logs create-razorpay-order

# Follow logs in real-time
supabase functions logs create-razorpay-order --follow
```

### View in Dashboard

Go to: `https://app.supabase.com/project/[your-project-ref]/functions`

## Security Notes

1. **Never expose RAZORPAY_KEY_SECRET in frontend**
2. **Always verify payments on backend** (using verify-razorpay-payment)
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** if needed
5. **Log all transactions** for audit trail
6. **Monitor function invocations** regularly

## Troubleshooting

### Error: "Razorpay credentials not configured"

**Solution:** Set secrets using:
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_secret
```

### Error: "Failed to create Razorpay order"

**Solution:** 
1. Check Razorpay dashboard for errors
2. Verify credentials are correct
3. Check function logs: `supabase functions logs create-razorpay-order`

### Error: "Payment signature verification failed"

**Solution:**
1. Ensure RAZORPAY_KEY_SECRET is set correctly
2. Check that signature is being passed from frontend
3. Verify order_id and payment_id are correct

## Cost

Supabase Edge Functions:
- **Free tier:** 500,000 invocations/month
- **Pro tier:** 2,000,000 invocations/month
- Additional: $2 per 1M invocations

For most e-commerce sites, free tier is sufficient.

## Next Steps

After deploying functions:

1. Update frontend `razorpayService.ts` to call these functions
2. Test with test keys first
3. Switch to live keys in production
4. Set up webhooks for payment status updates
5. Monitor function performance

## Support

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Deno Deploy Docs](https://deno.com/deploy/docs)

