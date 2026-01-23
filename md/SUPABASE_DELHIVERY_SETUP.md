# Supabase Delhivery Edge Function Setup

## ✅ Current Status

Your `delhivery-api` Edge Function is already created and ready to use! Now you just need to configure it.

---

## 🔧 **Setup Steps**

### **Step 1: Set Delhivery API Token as Supabase Secret**

You need to add your Delhivery API token as a secret in Supabase so the Edge Function can use it.

#### **Option A: Via Supabase Dashboard (Easiest)**

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **"Add new secret"**
4. Set:
   - **Name:** `DELHIVERY_API_TOKEN`
   - **Value:** Your actual Delhivery API token (from Delhivery dashboard)
5. Click **"Save"**

#### **Option B: Via Supabase CLI**

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Set the secret
supabase secrets set DELHIVERY_API_TOKEN=your-actual-delhivery-token-here
```

---

### **Step 2: Deploy/Update the Edge Function**

If you haven't deployed the Edge Function yet, or need to redeploy:

```bash
# Deploy the delhivery-api function
supabase functions deploy delhivery-api

# Verify it's deployed
supabase functions list
```

---

### **Step 3: Update Frontend Environment Variable**

The frontend code is now configured to use the Supabase Edge Function by default.

In your `.env` file:

```env
# Supabase Delhivery Proxy (default: enabled)
VITE_USE_SUPABASE_DELHIVERY_PROXY=true

# You can remove this from .env since it's now in Supabase secrets
# VITE_DELHIVERY_API_TOKEN=your-token

# Keep Supabase config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 **Testing the Setup**

### **Test 1: Health Check**

Call the Edge Function directly to verify it's working:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/delhivery-api \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "/api/pin-codes/json/",
    "data": { "filter_codes": "122001" },
    "endpoint": "staging",
    "method": "GET"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "delivery_codes": [...]
  },
  "status": 200
}
```

### **Test 2: From Frontend**

In your shipping admin panel:
1. Try creating a warehouse → Should work without CORS errors
2. Try requesting a pickup → Should work without CORS errors
3. Check browser console for logs:
   ```
   📡 Calling Delhivery via Supabase Edge Function: /fm/request/new/
   ✅ Delhivery API call successful via Edge Function
   ✅ Pickup requested via Delhivery API, Pickup ID: PKP123456
   ```

---

## 🔍 **Troubleshooting**

### **Issue: "Delhivery API token not configured"**

**Solution:**
- Verify the secret is set in Supabase:
  ```bash
  supabase secrets list
  ```
- Should show `DELHIVERY_API_TOKEN` in the list
- If not, set it using Step 1 above

### **Issue: "Edge Function error: Failed to invoke function"**

**Solution:**
- Ensure Edge Function is deployed:
  ```bash
  supabase functions list
  ```
- Redeploy if needed:
  ```bash
  supabase functions deploy delhivery-api
  ```

### **Issue: "401 Unauthorized from Delhivery"**

**Solution:**
- Check if your Delhivery token is valid
- Verify you're using the correct token for staging/production
- Update the secret in Supabase

### **Issue: Still getting CORS errors**

**Solution:**
- Verify `VITE_USE_SUPABASE_DELHIVERY_PROXY` is not set to `false` in `.env`
- Check browser console to confirm it's using Edge Function:
  ```
  📡 Calling Delhivery via Supabase Edge Function: ...
  ```
- If you see direct API calls, the proxy is not enabled

---

## 📊 **How It Works**

### **Old Flow (CORS Error):**
```
Browser → Delhivery API ❌
(Blocked by CORS)
```

### **New Flow (Working):**
```
Browser → Supabase Edge Function → Delhivery API ✅
(No CORS issues!)
```

### **Request Format:**

Your frontend sends requests to Supabase Edge Function:
```typescript
const { data: result, error } = await supabase.functions.invoke('delhivery-api', {
  body: {
    action: '/fm/request/new/',  // Delhivery endpoint
    data: {                       // Request payload
      pickup_time: '11:00:00',
      pickup_date: '2024-10-20',
      warehouse_name: 'Main Warehouse',
      quantity: 5
    },
    endpoint: 'staging',          // or 'express' or 'track'
    method: 'POST'                // or 'GET', 'PUT', 'DELETE'
  }
});
```

Edge Function adds authentication and forwards to Delhivery:
```typescript
const response = await fetch('https://staging-express.delhivery.com/fm/request/new/', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${DELHIVERY_API_TOKEN}`,  // From Supabase secret
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

---

## 🔒 **Security Benefits**

✅ **API key never exposed** - Token stays secure in Supabase secrets  
✅ **No CORS issues** - Edge Function runs server-side  
✅ **No frontend changes needed** - Uses existing `supabase` client  
✅ **Rate limiting possible** - Can add custom logic in Edge Function  
✅ **Logging & monitoring** - All requests logged in Supabase  

---

## 🚀 **What's Already Working**

The following have been updated to use Supabase Edge Function:
- ✅ **Pickup Requests** - `requestPickup()`
- 🔄 **Other methods** - Can be updated similarly if needed:
  - Warehouse creation
  - Shipment creation
  - Tracking
  - Waybill generation

---

## 📝 **Next Steps (Optional)**

If you want to update other Delhivery operations to use the Edge Function:

1. Find the method in `DelhiveryService.ts`
2. Replace direct API call with:
   ```typescript
   if (USE_SUPABASE_PROXY) {
     responseData = await callDelhiveryViaSupabase(endpoint, data, 'staging', 'POST');
   } else {
     // existing axios call
   }
   ```

Example methods that could be updated:
- `createWarehouseWithValidation()`
- `editWarehouseWithValidation()`
- `createShipment()`
- `generateWaybills()`
- `trackShipment()`

---

## ✅ **Verification Checklist**

- [ ] Delhivery API token set in Supabase secrets
- [ ] Edge Function deployed
- [ ] `VITE_USE_SUPABASE_DELHIVERY_PROXY=true` in `.env` (or not set, defaults to true)
- [ ] Supabase URL and anon key configured in `.env`
- [ ] Tested pickup request from frontend
- [ ] No CORS errors in browser console
- [ ] See Edge Function logs in console: `📡 Calling Delhivery via Supabase Edge Function`

---

## 🎉 **Expected Result**

Once setup is complete:
```
✅ Browser → Supabase Edge Function → Delhivery API
✅ Pickup requests work correctly
✅ No CORS errors
✅ API key secure
✅ Warehouse management works
✅ All Delhivery features functional
```

**Your pickup requests will now work via Supabase!** 🚀

