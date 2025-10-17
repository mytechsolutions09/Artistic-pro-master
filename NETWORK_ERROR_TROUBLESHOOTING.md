# Network Error Troubleshooting Guide

## 🚨 "Network error. Please check your internet connection and try again."

This error can occur for several reasons. Follow these steps to diagnose and fix:

---

## 1️⃣ **Check Internet Connection**

### Test Your Connection:
```bash
# Windows
ping google.com

# Check if you can reach Delhivery
ping staging-express.delhivery.com
```

✅ **If ping works:** Internet is fine, move to step 2  
❌ **If ping fails:** Check your internet connection

---

## 2️⃣ **Check Supabase Connection**

### Verify Supabase Credentials:
1. Open `.env` file
2. Check these values are set:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Test in browser console (F12):
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL);
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

✅ **Values show correctly:** Supabase OK, move to step 3  
❌ **Values are undefined:** Restart dev server: `npm run dev`

---

## 3️⃣ **Check Delhivery API Configuration**

### Verify Delhivery API Token:
1. Open `.env` file
2. Check this value:
   ```env
   VITE_DELHIVERY_API_TOKEN=your-actual-token-here
   ```

3. Make sure it's NOT:
   - `your-delhivery-api-token` ❌
   - `xxxxxxxxxxxxxxxx` ❌
   - Empty ❌

### Test API Token:
```bash
curl -X POST "https://staging-express.delhivery.com/api/cmu/create.json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_API_TOKEN"
```

✅ **Returns JSON response:** API token works  
❌ **Returns 401/403:** API token is invalid - get new one from Delhivery

---

## 4️⃣ **CORS Issues (Most Common)**

### Problem:
Delhivery API may block requests from localhost due to CORS policy.

### Solution Options:

#### **Option A: Use Supabase Edge Functions (Recommended)**
Create a proxy through Supabase to avoid CORS:

1. Create file: `supabase/functions/delhivery-proxy/index.ts`
2. Deploy: `supabase functions deploy delhivery-proxy`
3. Update code to use edge function instead of direct API calls

#### **Option B: Browser CORS Extension (Development Only)**
Install "CORS Unblock" or similar browser extension

⚠️ **Warning:** Only use in development, not production!

#### **Option C: Backend Proxy**
Set up a Node.js backend to proxy Delhivery requests

---

## 5️⃣ **Check Console for Specific Errors**

### Open Browser DevTools (F12):
1. Go to **Console** tab
2. Look for errors:

**Common Error Messages:**

```
❌ "Failed to fetch" 
   → CORS issue or network down

❌ "ERR_NETWORK_CHANGED"
   → Your IP changed (reconnect WiFi)

❌ "401 Unauthorized"
   → Invalid API token

❌ "403 Forbidden"
   → API token doesn't have permissions

❌ "CORS policy" error
   → Need proxy/edge function

❌ "Supabase client failed"
   → Check Supabase credentials
```

---

## 6️⃣ **Quick Fixes**

### Fix 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Fix 2: Clear Browser Cache
```
Ctrl + Shift + Delete → Clear cache → Reload page
```

### Fix 3: Check .env is Loaded
Add this to your code temporarily:
```typescript
console.log('🔍 API Config:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  delhiveryToken: import.meta.env.VITE_DELHIVERY_API_TOKEN ? '✅ Set' : '❌ Missing'
});
```

### Fix 4: Use Staging Endpoints
Ensure you're using staging endpoints in `.env`:
```env
VITE_DELHIVERY_BASE_URL=https://staging-express.delhivery.com
VITE_DELHIVERY_EXPRESS_URL=https://express-dev-test.delhivery.com
```

---

## 7️⃣ **Enable Debug Mode**

Add this to see detailed errors:

```typescript
// In DelhiveryService.ts
catch (error) {
  console.error('🚨 Detailed Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    config: error.config
  });
}
```

---

## 8️⃣ **Test with Curl**

### Test Pincode Check:
```bash
curl "https://staging-express.delhivery.com/c/api/pin-codes/json/?filter_codes=110001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN"
```

### Test Warehouse Creation:
```bash
curl -X POST "https://staging-express.delhivery.com/api/backend/clientwarehouse/create/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"name":"Test","phone":"9999999999","city":"Mumbai","pin":"400001","address":"Test Address","email":"test@example.com"}'
```

---

## 9️⃣ **Firewall/Antivirus Check**

Sometimes firewall blocks API requests:

1. **Windows Defender Firewall:**
   - Add exception for Node.js
   - Add exception for your browser

2. **Antivirus:**
   - Temporarily disable to test
   - Add localhost:5173 to whitelist

---

## 🔟 **Still Not Working?**

### Check These:

1. **VPN/Proxy:**
   - Disable VPN and try again
   - Some corporate proxies block API calls

2. **Network Restrictions:**
   - Check if your network blocks certain APIs
   - Try mobile hotspot

3. **API Status:**
   - Check Delhivery API status page
   - Contact Delhivery support

4. **Rate Limiting:**
   - You may have hit rate limits
   - Wait 5-10 minutes and try again

---

## ✅ **Solution Checklist**

- [ ] Internet connection working
- [ ] Supabase URL and keys configured
- [ ] Delhivery API token configured
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Console shows no CORS errors
- [ ] API endpoints are reachable
- [ ] Firewall not blocking requests

---

## 🆘 **Get Help**

If still facing issues, share:
1. Browser console error screenshot
2. Network tab error details (F12 → Network)
3. Your environment (Windows/Mac, Browser)
4. Which feature causes the error (warehouse/pickup/shipment)

---

## 📚 **Related Guides**

- `DELHIVERY_SETUP_GUIDE.md` - API setup instructions
- `SUPABASE_INIT_FIX.md` - Supabase configuration
- `ENV_SETUP_COMPLETE.md` - Environment variables

---

**Last Updated:** Oct 2025

