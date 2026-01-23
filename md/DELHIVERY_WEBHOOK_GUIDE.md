# Delhivery Webhook Integration Guide

## Overview

Delhivery provides **real-time webhooks** for:
1. **Shipment Status Updates** - Get notified when shipment status changes
2. **POD (Proof of Delivery) Push** - Receive EPOD automatically when delivered

Webhooks eliminate the need for constant polling and provide event-driven updates.

---

## How Webhooks Work

When a specific event occurs (e.g., shipment delivered), Delhivery sends a **POST request** with JSON data to your pre-configured endpoint.

```
Shipment Event → Delhivery System → POST Request → Your Server
```

**Benefits:**
- ✅ Real-time updates
- ✅ No constant polling required
- ✅ Event-driven architecture
- ✅ Automatic notifications

---

## Prerequisites

### 1. **Fill Webhook Requirements Document**
Contact Delhivery at: **lastmile-integration@delhivery.com**

Provide:
- Account name
- Webhook endpoint URL (your server)
- Authorization details
- Required payload format

### 2. **Whitelist Delhivery IPs**
You need to whitelist Delhivery's IP addresses to receive webhooks. IPs will be provided in the requirements document.

### 3. **Development Timeline**
After submission: **4-5 business days** for development, testing, and deployment

---

## Webhook Types

### 1. Shipment Status Webhook

Receive status updates at different levels:
- **LR Level** - Individual Load Receipt Number
- **Master AWB Level** - Master Air Waybill
- **Child Box Level** - Individual boxes

**Features:**
- Real-time status push
- All status changes are sent
- Multiple Delhivery codes can map to one client code
- Custom payload mapping supported
- Additional data can be included

### 2. POD (Proof of Delivery) Webhook

Receive POD automatically when shipment is delivered.

**POD Formats Available:**
1. **S3 URL** - Downloadable link (7-day expiry)
2. **Base64 Encoded** - Direct base64 string
3. **Form Data** - Multipart form data

**Note:** If POD is re-uploaded (corrected), webhook will trigger again.

---

## Shipment Status Types

### Forward Shipment (Warehouse → Customer)

| Status Type | Status | Description |
|-------------|--------|-------------|
| UD | Manifested | Order created in Delhivery system |
| UD | Not Picked | Shipment not picked from warehouse |
| UD | In Transit | Shipment moving to destination |
| UD | Pending | Reached destination, not dispatched yet |
| UD | Dispatched | Out for delivery to customer |
| DL | Delivered | Successfully delivered to customer |

### Return Shipment (Unsuccessful Delivery)

| Status Type | Status | Description |
|-------------|--------|-------------|
| RT | In Transit | Converted to return after failed delivery |
| RT | Pending | Reached DC nearest to origin |
| RT | Dispatched | Dispatched for return delivery |
| DL | RTO | Returned to Origin |

### Other Statuses

| Status Type | Status | Description |
|-------------|--------|-------------|
| LT | Lost | Shipment lost in transit |

---

## Implementation Steps

### Step 1: Create Webhook Endpoint

Create an endpoint on your server to receive webhooks:

```typescript
// Example: Express.js endpoint
app.post('/api/webhooks/delhivery/status', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook authenticity (check authorization header)
    const authHeader = req.headers.authorization;
    if (!verifyDelhiveryWebhook(authHeader)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Process the webhook
    await processShipmentStatus(webhookData);
    
    // Respond immediately
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

### Step 2: Handle Shipment Status Updates

```typescript
async function processShipmentStatus(data: any) {
  const {
    lrn,
    status,
    status_type,
    timestamp,
    location,
    remarks
  } = data;
  
  // Update your database
  await updateShipmentInDatabase({
    lrn: lrn,
    status: status,
    statusType: status_type,
    updatedAt: timestamp,
    location: location,
    remarks: remarks
  });
  
  // Notify customer if needed
  if (status === 'Delivered') {
    await notifyCustomer(lrn);
  }
  
  // Log the update
  console.log(`Shipment ${lrn} status updated to: ${status}`);
}
```

### Step 3: Handle POD Webhook

```typescript
app.post('/api/webhooks/delhivery/pod', async (req, res) => {
  try {
    const { lrn, pod_url, pod_base64 } = req.body;
    
    if (pod_url) {
      // Download from S3 URL
      await downloadAndSavePOD(lrn, pod_url);
    } else if (pod_base64) {
      // Convert base64 to PDF
      await savePODFromBase64(lrn, pod_base64);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('POD webhook error:', error);
    res.status(500).json({ error: 'Failed to process POD' });
  }
});
```

---

## Webhook Payload Examples

### Shipment Status Webhook

```json
{
  "lrn": "220179514",
  "status": "Delivered",
  "status_type": "DL",
  "timestamp": "2025-01-20T14:30:00Z",
  "location": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "consignee_name": "John Doe",
  "awb": "DL123456789",
  "remarks": "Delivered to customer",
  "delivered_to": "John Doe",
  "delivered_date": "2025-01-20",
  "delivered_time": "14:30:00"
}
```

### POD Webhook (S3 URL)

```json
{
  "lrn": "220179514",
  "awb": "DL123456789",
  "pod_url": "https://s3.amazonaws.com/delhivery-pod/220179514.pdf",
  "pod_expiry": "2025-01-27T14:30:00Z",
  "delivered_date": "2025-01-20",
  "delivered_to": "John Doe",
  "signature_url": "https://s3.amazonaws.com/delhivery-pod/220179514-sign.jpg"
}
```

### POD Webhook (Base64)

```json
{
  "lrn": "220179514",
  "awb": "DL123456789",
  "pod_base64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZS...",
  "delivered_date": "2025-01-20",
  "delivered_to": "John Doe"
}
```

---

## Security Best Practices

### 1. Verify Webhook Source
```typescript
function verifyDelhiveryWebhook(authHeader: string): boolean {
  const expectedToken = process.env.DELHIVERY_WEBHOOK_SECRET;
  return authHeader === `Bearer ${expectedToken}`;
}
```

### 2. Whitelist IPs
```typescript
const DELHIVERY_IPS = [
  '103.x.x.x',
  '104.x.x.x',
  // Add IPs provided by Delhivery
];

function isDelhiveryIP(ip: string): boolean {
  return DELHIVERY_IPS.includes(ip);
}
```

### 3. Validate Payload
```typescript
function validateWebhookPayload(data: any): boolean {
  // Check required fields
  if (!data.lrn || !data.status) {
    return false;
  }
  
  // Validate status type
  const validStatusTypes = ['UD', 'DL', 'RT', 'LT'];
  if (!validStatusTypes.includes(data.status_type)) {
    return false;
  }
  
  return true;
}
```

---

## Database Integration

### Store Webhook Events

```typescript
// Create a webhook_events table
interface WebhookEvent {
  id: string;
  lrn: string;
  event_type: 'status' | 'pod';
  status?: string;
  status_type?: string;
  payload: any;
  received_at: Date;
  processed: boolean;
  processed_at?: Date;
}

async function storeWebhookEvent(data: any, type: 'status' | 'pod') {
  await supabase
    .from('webhook_events')
    .insert({
      lrn: data.lrn,
      event_type: type,
      status: data.status,
      status_type: data.status_type,
      payload: data,
      received_at: new Date(),
      processed: false
    });
}
```

### Update Order Status

```typescript
async function updateOrderFromWebhook(lrn: string, status: string) {
  // Find order by LRN
  const { data: shipment } = await supabase
    .from('shipments')
    .select('order_id')
    .eq('waybill', lrn)
    .single();
  
  if (shipment) {
    // Map Delhivery status to your internal status
    const internalStatus = mapDelhiveryStatus(status);
    
    // Update order
    await supabase
      .from('orders')
      .update({ 
        status: internalStatus,
        last_updated: new Date()
      })
      .eq('id', shipment.order_id);
    
    // Send customer notification
    await sendStatusNotification(shipment.order_id, internalStatus);
  }
}

function mapDelhiveryStatus(delhiveryStatus: string): string {
  const statusMap: Record<string, string> = {
    'Manifested': 'processing',
    'In Transit': 'in_transit',
    'Dispatched': 'out_for_delivery',
    'Delivered': 'delivered',
    'RTO': 'returned',
    'Lost': 'lost'
  };
  
  return statusMap[delhiveryStatus] || 'processing';
}
```

---

## Testing Webhooks Locally

### 1. Use ngrok for Local Testing

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm run dev

# Expose local server
ngrok http 3000
```

### 2. Provide ngrok URL to Delhivery

```
Your webhook URL: https://abc123.ngrok.io/api/webhooks/delhivery/status
```

### 3. Test with Mock Data

```typescript
// Create a test endpoint to simulate webhooks
app.post('/test/webhook/simulate', async (req, res) => {
  const mockWebhook = {
    lrn: '220179514',
    status: 'Delivered',
    status_type: 'DL',
    timestamp: new Date().toISOString(),
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  };
  
  // Call your webhook handler
  await processShipmentStatus(mockWebhook);
  
  res.json({ success: true });
});
```

---

## Supabase Edge Function for Webhook

You can create a Supabase Edge Function to handle webhooks:

```typescript
// supabase/functions/delhivery-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const webhookData = await req.json()
    
    // Verify webhook
    const authHeader = req.headers.get('authorization')
    const expectedToken = Deno.env.get('DELHIVERY_WEBHOOK_SECRET')
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Store webhook event
    await supabase
      .from('webhook_events')
      .insert({
        lrn: webhookData.lrn,
        event_type: 'status',
        payload: webhookData,
        received_at: new Date().toISOString()
      })
    
    // Update shipment status
    await supabase
      .from('shipments')
      .update({ 
        status: webhookData.status,
        delhivery_status: webhookData.status_type
      })
      .eq('waybill', webhookData.lrn)
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Monitoring & Logging

### Log All Webhook Events

```typescript
async function logWebhook(data: any) {
  console.log('='.repeat(50));
  console.log('📥 Webhook Received:', new Date().toISOString());
  console.log('LRN:', data.lrn);
  console.log('Status:', data.status);
  console.log('Type:', data.status_type);
  console.log('Payload:', JSON.stringify(data, null, 2));
  console.log('='.repeat(50));
}
```

### Track Processing Time

```typescript
async function processWebhookWithMetrics(data: any) {
  const startTime = Date.now();
  
  try {
    await processShipmentStatus(data);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Webhook processed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Webhook failed after ${duration}ms:`, error);
    throw error;
  }
}
```

---

## Troubleshooting

### Webhook Not Received

1. **Check IP Whitelisting**
   - Verify Delhivery IPs are whitelisted in your firewall
   
2. **Verify Endpoint is Accessible**
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/delhivery/status \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. **Check Logs**
   - Server logs
   - Edge Function logs: `supabase functions logs delhivery-webhook`

### Duplicate Webhooks

Delhivery may send the same webhook multiple times. Implement idempotency:

```typescript
async function processSafely(webhookData: any) {
  const { lrn, timestamp } = webhookData;
  
  // Check if already processed
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('lrn', lrn)
    .eq('timestamp', timestamp)
    .single();
  
  if (existing) {
    console.log('Duplicate webhook, skipping');
    return;
  }
  
  // Process normally
  await processShipmentStatus(webhookData);
}
```

---

## Contact Delhivery

**For webhook setup:**
📧 **lastmile-integration@delhivery.com**

**Include in email:**
- Company name
- Account ID
- Webhook endpoint URL
- Authentication method
- Payload format preference
- Required statuses
- Business POC contact

**Response time:** 4-5 business days

---

## Quick Setup Checklist

- [ ] Contact Delhivery with webhook requirements
- [ ] Create webhook endpoint on your server
- [ ] Whitelist Delhivery IP addresses
- [ ] Implement authentication verification
- [ ] Set up database tables for webhook events
- [ ] Implement status mapping logic
- [ ] Add customer notifications
- [ ] Test with ngrok/staging environment
- [ ] Monitor webhook logs
- [ ] Deploy to production
- [ ] Verify with Delhivery team

---

**Documentation Version:** 1.0  
**Last Updated:** October 18, 2025  
**Status:** Ready for implementation

