## Razorpay Payment Gateway Integration

Complete guide for integrating Razorpay payment gateway into your e-commerce application.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Implementation](#implementation)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Security Best Practices](#security-best-practices)

---

## Overview

This integration provides:
- Secure payment processing with Razorpay
- Order tracking and management
- Refund processing
- Payment verification
- Database storage for payment records
- Support for multiple payment methods (Cards, UPI, Wallets, Net Banking)

---

## Prerequisites

1. **Razorpay Account**
   - Sign up at [https://razorpay.com](https://razorpay.com)
   - Complete KYC verification
   - Get API keys from Dashboard

2. **Supabase Project**
   - Active Supabase project
   - Database access

3. **Node.js & npm**
   - Node.js 16+ installed
   - npm or yarn package manager

---

## Environment Setup

### Step 1: Get Razorpay API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Generate API keys (Test mode for development)
4. Copy **Key ID** and **Key Secret**

### Step 2: Update .env File

Add the following to your `.env` file:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
VITE_RAZORPAY_KEY_SECRET=your_secret_key_here

# Razorpay Settings
VITE_RAZORPAY_CURRENCY=INR
VITE_RAZORPAY_COMPANY_NAME=Lurevi
VITE_RAZORPAY_COMPANY_LOGO=https://yourdomain.com/logo.png
VITE_RAZORPAY_THEME_COLOR=#0d9488
```

**Important Notes:**
- Use **Test Keys** for development (starts with `rzp_test_`)
- Use **Live Keys** for production (starts with `rzp_live_`)
- Never commit `.env` file to version control
- Keep `KEY_SECRET` secure and never expose it in frontend code

---

## 🗄️ Database Setup

### Step 1: Run SQL Script

Execute the SQL script in your Supabase SQL Editor:

```bash
# File: setup_razorpay_database.sql
```

This creates:
- `razorpay_orders` table - Stores payment records
- `razorpay_refunds` table - Tracks refunds
- RLS policies for security
- Indexes for performance
- Triggers for automatic timestamps

### Step 2: Verify Tables

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('razorpay_orders', 'razorpay_refunds');
```

---

## 💻 Implementation

### Import Razorpay Service

```typescript
import razorpayService from './services/razorpayService';
```

### Basic Payment Flow

```typescript
// 1. Prepare order details
const orderDetails = {
  orderId: 'ORDER_123',
  amount: 1000, // Amount in INR
  currency: 'INR',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+919999999999',
  customerId: 'user_123',
  description: 'Order for 2 items'
};

// 2. Initiate payment
await razorpayService.initiatePayment(
  orderDetails,
  // Success callback
  (response) => {
    console.log('Payment successful!', response);
    // Navigate to success page
    window.location.href = '/payment-success';
  },
  // Failure callback
  (error) => {
    console.error('Payment failed:', error);
    // Navigate to failure page
    window.location.href = '/payment-failed';
  }
);
```

### Integration in Checkout Page

```typescript
const handlePayment = async () => {
  try {
    setLoading(true);
    
    const orderDetails = {
      orderId: order.id,
      amount: order.total,
      currency: 'INR',
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerId: user.id,
      description: `Order #${order.id}`
    };

    await razorpayService.initiatePayment(
      orderDetails,
      handlePaymentSuccess,
      handlePaymentFailure
    );
  } catch (error) {
    console.error('Payment error:', error);
    setError('Failed to initiate payment');
  } finally {
    setLoading(false);
  }
};

const handlePaymentSuccess = (response) => {
  // Update order status
  updateOrderStatus(order.id, 'paid');
  // Show success message
  navigate('/payment-success', { 
    state: { 
      paymentId: response.razorpay_payment_id 
    } 
  });
};

const handlePaymentFailure = (error) => {
  // Log error
  console.error('Payment failed:', error);
  // Show error message
  navigate('/payment-failed', { 
    state: { 
      error: error.message 
    } 
  });
};
```

---

## 🧪 Testing

### Test Mode

1. **Use Test API Keys**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   ```

2. **Test Card Details**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

3. **Test UPI**
   - UPI ID: `success@razorpay`
   - This will simulate successful payment

4. **Test Failure**
   - UPI ID: `failure@razorpay`
   - This will simulate failed payment

### Verify Payment in Dashboard

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Transactions** → **Payments**
3. Check test payments

---

## Production Deployment

### Step 1: Switch to Live Keys

1. Complete KYC verification on Razorpay
2. Get Live API keys from Dashboard
3. Update `.env` with live keys:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
   VITE_RAZORPAY_KEY_SECRET=your_live_secret_key
   ```

### Step 2: Backend Implementation (CRITICAL)

**Security Warning:** Payment verification MUST be done on backend!

Create a backend API endpoint:

```javascript
// Backend: /api/razorpay/create-order
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post('/api/razorpay/create-order', async (req, res) => {
  const { amount, currency, receipt } = req.body;
  
  const options = {
    amount: amount * 100, // paise
    currency: currency,
    receipt: receipt
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 3: Verify Payment Signature (Backend)

```javascript
// Backend: /api/razorpay/verify-payment
const crypto = require('crypto');

app.post('/api/razorpay/verify-payment', (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature 
  } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;
  
  res.json({ isValid });
});
```

### Step 4: Webhook Setup

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`
4. Save webhook secret

```javascript
// Backend: /api/razorpay/webhook
app.post('/api/razorpay/webhook', (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature === expectedSignature) {
    // Process webhook event
    const event = req.body.event;
    const payload = req.body.payload;
    
    // Handle different events
    switch(event) {
      case 'payment.captured':
        // Update order status
        break;
      case 'payment.failed':
        // Handle failed payment
        break;
      case 'refund.processed':
        // Update refund status
        break;
    }
    
    res.json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

---

## Security Best Practices

### 1. Never Expose Secrets
- Never commit `.env` file
- Never expose `KEY_SECRET` in frontend
- Use environment variables
- Keep secrets on backend only

### 2. Verify Payments on Backend
- Don't trust frontend verification
- Always verify signature on backend
- Use webhook for payment confirmation

### 3. Use HTTPS
- Always use HTTPS in production
- Ensure SSL certificate is valid

### 4. Implement Rate Limiting
- Limit payment attempts per user
- Implement CAPTCHA for suspicious activity

### 5. Log Everything
- Log all payment attempts
- Monitor for suspicious patterns
- Set up alerts for failures

---

## Payment Flow Diagram

```
User → Checkout Page → Razorpay Service
                           ↓
                    Create Order (Backend)
                           ↓
                    Razorpay Checkout Modal
                           ↓
                    User Enters Payment Details
                           ↓
                    Payment Processing
                           ↓
                    ┌──────┴──────┐
                    ↓             ↓
                Success        Failure
                    ↓             ↓
            Verify Signature   Show Error
            (Backend)
                    ↓
            Update Order Status
                    ↓
            Send Confirmation Email
                    ↓
            Redirect to Success Page
```

---

## 🆘 Troubleshooting

### Payment Modal Not Opening
- Check if Razorpay script is loaded
- Verify API key is correct
- Check browser console for errors

### Payment Verification Failed
- Ensure signature verification is done on backend
- Check if webhook secret is correct
- Verify payment ID and order ID match

### Database Errors
- Check if tables are created
- Verify RLS policies are set up
- Ensure user has proper permissions

---

## Support

- **Razorpay Docs:** [https://razorpay.com/docs](https://razorpay.com/docs)
- **Razorpay Support:** support@razorpay.com
- **Dashboard:** [https://dashboard.razorpay.com](https://dashboard.razorpay.com)

---

## Checklist

Before going live:

- [ ] KYC verification completed
- [ ] Live API keys obtained
- [ ] Backend payment verification implemented
- [ ] Webhook configured
- [ ] SSL certificate installed
- [ ] Payment flow tested end-to-end
- [ ] Error handling implemented
- [ ] Logging set up
- [ ] Refund process tested
- [ ] Customer support ready

---

**Last Updated:** October 7, 2025
**Version:** 1.0.0
