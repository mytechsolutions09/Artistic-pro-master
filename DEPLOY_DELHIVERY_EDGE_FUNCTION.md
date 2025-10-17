# Deploy Delhivery Edge Function - Manual Steps

## 🚀 Step-by-Step Deployment

### **Step 1: Set the Delhivery API Token Secret**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Project Settings** (gear icon in bottom left)
4. Click **Edge Functions**
5. Scroll to **Secrets** section
6. Click **"Add new secret"** or **"New secret"**
7. Enter:
   - **Name:** `DELHIVERY_API_TOKEN`
   - **Value:** Your actual Delhivery API token
8. Click **"Create secret"** or **"Save"**

---

### **Step 2: Deploy the Edge Function**

#### **Option A: Via Supabase Dashboard (Recommended)**

1. In your Supabase Dashboard, go to **Edge Functions** (left sidebar)
2. Click **"Deploy new function"** or **"Create function"**
3. Function name: `delhivery-api`
4. Copy the code from `supabase/functions/delhivery-api/index.ts`
5. Paste it into the editor
6. Click **"Deploy function"**

#### **Option B: Via VS Code Supabase Extension**

1. Install the Supabase extension in VS Code
2. Connect to your project
3. Right-click on `supabase/functions/delhivery-api/index.ts`
4. Select **"Deploy Function"**

#### **Option C: Manual File Upload**

1. Go to **Edge Functions** in Supabase Dashboard
2. Find or create `delhivery-api` function
3. Upload the `index.ts` file
4. Click **"Deploy"**

---

### **Step 3: Verify Deployment**

1. In Supabase Dashboard → **Edge Functions**
2. You should see `delhivery-api` in the list
3. Status should be **"Deployed"** or **"Active"**
4. Note the function URL (will be something like):
   ```
   https://your-project-ref.supabase.co/functions/v1/delhivery-api
   ```

---

### **Step 4: Test the Function**

#### **Test via Browser Console:**

1. Open your shipping admin page
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Try to request a pickup
5. Look for these logs:
   ```
   📡 Calling Delhivery via Supabase Edge Function: /fm/request/new/
   ✅ Delhivery API call successful via Edge Function
   ```

#### **Test via Dashboard:**

1. In Supabase Dashboard → **Edge Functions** → `delhivery-api`
2. Click **"Invoke"** or **"Test"**
3. Use this test payload:
   ```json
   {
     "action": "/fm/request/new/",
     "data": {
       "pickup_time": "11:00:00",
       "pickup_date": "2024-10-20",
       "warehouse_name": "Test Warehouse",
       "quantity": 2
     },
     "endpoint": "staging",
     "method": "POST"
   }
   ```
4. Click **"Run"**
5. Check response

---

## 🐛 **Troubleshooting**

### **Issue 1: "Delhivery API token not configured"**

**Check:**
```
Dashboard → Project Settings → Edge Functions → Secrets
```

**Verify:**
- Secret named exactly: `DELHIVERY_API_TOKEN`
- Value is your actual Delhivery token (not placeholder)

**Fix:**
- Delete and recreate the secret if it exists
- Redeploy the function after setting the secret

---

### **Issue 2: Function not found / 404**

**Check:**
- Function is deployed (shows in Edge Functions list)
- Function name is exactly: `delhivery-api`

**Fix:**
- Redeploy the function
- Check function name matches exactly

---

### **Issue 3: Still getting CORS/Network errors**

**Check browser console for:**
```javascript
// Should see:
📡 Calling Delhivery via Supabase Edge Function: ...

// Should NOT see:
Calling Delhivery API directly...
```

**If NOT using Edge Function:**

Check `.env` file:
```env
# Make sure this is NOT set to false
VITE_USE_SUPABASE_DELHIVERY_PROXY=true

# Or just remove the line (defaults to true)
```

**Then restart dev server:**
```bash
npm run dev
```

---

### **Issue 4: "Edge Function error" in console**

**Check Edge Function logs:**

1. Supabase Dashboard → **Edge Functions** → `delhivery-api`
2. Click **"Logs"** tab
3. Look for error messages

**Common errors:**

- **"DELHIVERY_API_TOKEN undefined"** → Set the secret
- **"Failed to fetch"** → Check Delhivery token is valid
- **"401 Unauthorized"** → Wrong Delhivery token or expired

---

## 🧪 **Quick Test Script**

Run this in browser console on your shipping page:

```javascript
// Test the Edge Function directly
const testPickup = async () => {
  const { data, error } = await supabase.functions.invoke('delhivery-api', {
    body: {
      action: '/fm/request/new/',
      data: {
        pickup_time: '11:00:00',
        pickup_date: '2024-10-20',
        warehouse_name: 'Test Warehouse',
        quantity: 2
      },
      endpoint: 'staging',
      method: 'POST'
    }
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Success:', data);
  }
};

testPickup();
```

**Expected result:**
```javascript
✅ Success: {
  success: true,
  data: {
    pickup_id: "PKP123456",
    // ... other Delhivery response data
  },
  status: 200
}
```

---

## 📋 **Checklist Before Testing**

- [ ] Delhivery API token obtained from Delhivery dashboard
- [ ] Secret `DELHIVERY_API_TOKEN` set in Supabase
- [ ] Edge Function `delhivery-api` deployed
- [ ] Function shows as "Active" in dashboard
- [ ] `.env` has `VITE_USE_SUPABASE_DELHIVERY_PROXY=true` (or not set)
- [ ] Dev server restarted after `.env` changes
- [ ] Browser cache cleared / hard refresh (Ctrl+Shift+R)

---

## 🔍 **Debugging Steps**

### **1. Check if Edge Function is being called:**

Open browser console while requesting pickup:
```
Should see: 📡 Calling Delhivery via Supabase Edge Function
Should NOT see: Network error / CORS error
```

### **2. Check Edge Function logs:**

Supabase Dashboard → Edge Functions → delhivery-api → Logs

Look for:
```
📦 Delhivery API Request: POST https://...
📝 Request Data: {"pickup_time":"11:00:00",...}
✅ Delhivery API Response Status: 200
```

### **3. Check browser Network tab:**

Filter for: `functions/v1/delhivery-api`

Should see:
- Status: 200
- Response: `{"success": true, "data": {...}}`

### **4. Check frontend logs:**

Console should show:
```
📡 Calling Delhivery via Supabase Edge Function: /fm/request/new/
✅ Delhivery API call successful via Edge Function
✅ Pickup requested via Delhivery API, Pickup ID: PKP123456
✅ Updated 3 shipment(s) in database
```

---

## 🎯 **If Everything is Correct But Still Not Working**

### **Verify Delhivery API Token:**

1. Log into Delhivery dashboard
2. Go to API Settings
3. Copy the token
4. Test it manually:

```bash
curl -X POST https://staging-express.delhivery.com/fm/request/new/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_time": "11:00:00",
    "pickup_date": "2024-10-20",
    "warehouse_name": "Test",
    "quantity": 1
  }'
```

**If this fails:**
- Token is invalid or expired
- Get new token from Delhivery
- Update secret in Supabase

**If this works:**
- Token is valid
- Issue is with Edge Function deployment
- Check Edge Function logs in detail

---

## ✅ **Final Verification**

After deployment, in your shipping admin:

1. **Select shipments** with waybills
2. **Choose pickup location** from warehouse dropdown
3. **Set pickup date**
4. Click **"Request Pickup"**

**Expected:**
- ✅ Success message: "Pickup requested via Delhivery for X shipment(s)!"
- ✅ Console shows: "Pickup ID: PKP123456"
- ✅ Shipments updated in database with pickup date
- ✅ No CORS errors

---

## 📞 **Need Help?**

If you're still stuck after following all steps:

1. Share the **browser console logs** (all messages)
2. Share the **Edge Function logs** from Supabase Dashboard
3. Share the **Network tab** response for `delhivery-api` call
4. Confirm the secret is set correctly in Supabase

I'll help you debug! 🚀

