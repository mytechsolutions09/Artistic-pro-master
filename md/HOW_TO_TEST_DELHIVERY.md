# How to Test Delhivery API Integration

You can test the Delhivery API integration both **locally** and on your **live website**. Here's how:

## 🏠 **Option 1: Test Locally**

### **Method A: Using the Test HTML File**

1. **Open the test file:**
   ```powershell
   # Navigate to project root
   cd H:\site\Artistic-pro-master
   
   # Open test-delhivery-api.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then open: http://localhost:8000/test-delhivery-api.html
   ```

2. **Click "Generate 1 Waybill" button**
   - This will test the waybill API directly
   - Check the browser console (F12) for detailed logs

### **Method B: Test in Your Local Admin Panel**

1. **Start your development server:**
   ```powershell
   npm run dev
   # or
   yarn dev
   ```

2. **Navigate to Admin Shipping Page:**
   - Go to: `http://localhost:5173/admin/shipping` (or your local port)
   - Login as admin

3. **Test Waybill Generation:**
   - Click on **"Generate Waybills"** tab
   - Enter count: `1`
   - Click **"Generate Waybills"** button
   - Check browser console (F12) for logs

4. **Test Shipment Creation:**
   - Go to **"Create Shipment"** tab
   - Fill in shipment details
   - Click **"Create Shipment"**
   - Check if waybill is generated (should NOT start with `MOCK` or `LOCAL_`)

---

## 🌐 **Option 2: Test on Live Website**

### **Steps:**

1. **Deploy your changes:**
   ```powershell
   # Make sure Edge Function is deployed
   npx supabase@latest functions deploy delhivery-api --no-verify-jwt
   
   # Push code changes
   git add .
   git commit -m "Fix waybill API endpoint"
   git push
   ```

2. **Access your live admin panel:**
   - Go to: `https://your-domain.com/admin/shipping`
   - Login as admin

3. **Test the same way as locally:**
   - Generate waybills
   - Create shipments
   - Check browser console for errors

---

## 🔍 **What to Check**

### **✅ Success Indicators:**

1. **Real Waybill Generated:**
   - Waybill should start with `DL` (e.g., `DL123456789`)
   - Should NOT start with `MOCK` or `LOCAL_`

2. **Browser Console Shows:**
   ```
   ✅ Making API call: {action: '/waybill/api/bulk/json/?count=1', endpoint: 'track'}
   ✅ Edge Function response: {success: true, data: {...}}
   ✅ Generated waybill: DL123456789
   ```

3. **No Errors:**
   - No `❌ API call unsuccessful` messages
   - No `400 Bad Request` errors

### **❌ Error Indicators:**

1. **Mock Waybill:**
   - Waybill starts with `MOCK` → API not configured or Edge Function not deployed

2. **Local Waybill:**
   - Waybill starts with `LOCAL_` → Edge Function called but Delhivery API failed

3. **Browser Console Errors:**
   - `400 Bad Request` → Check endpoint/parameters
   - `401 Unauthorized` → Check DELHIVERY_API_TOKEN secret
   - `Edge Function error` → Check Edge Function deployment

---

## 🧪 **Quick Browser Console Test**

You can also test directly in browser console on your admin page:

```javascript
// Test waybill generation
(async () => {
  const { data, error } = await supabase.functions.invoke('delhivery-api', {
    body: {
      action: '/waybill/api/bulk/json/?count=1',
      method: 'GET',
      endpoint: 'track'
    }
  });
  
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ Waybills:', data.data.waybills);
  } else {
    console.error('❌ Error:', data);
  }
})();
```

---

## 📋 **Checklist Before Testing**

- [ ] Edge Function deployed: `npx supabase@latest functions deploy delhivery-api`
- [ ] DELHIVERY_API_TOKEN secret set: `npx supabase@latest secrets set DELHIVERY_API_TOKEN=your-token`
- [ ] Browser console open (F12) to see logs
- [ ] Network tab open to see API calls

---

## 🐛 **If You See Errors**

### **Check Browser Console:**
- Look for `📄 Full response data:` - shows exact Delhivery error
- Look for `❌ API call unsuccessful:` - shows what went wrong

### **Check Edge Function Logs:**
```powershell
# View recent logs
npx supabase@latest functions logs delhivery-api
```

### **Common Issues:**

1. **400 Bad Request:**
   - Check if endpoint is correct (`track` not `main`)
   - Check if parameters are correct
   - Check Edge Function logs for actual Delhivery error

2. **401 Unauthorized:**
   - Token might be invalid or expired
   - Update token: `npx supabase@latest secrets set DELHIVERY_API_TOKEN=new-token`

3. **Edge Function not found:**
   - Deploy it: `npx supabase@latest functions deploy delhivery-api`

---

## 📝 **Test Results**

After testing, you should see:
- ✅ Real Delhivery waybills (starting with `DL`)
- ✅ Shipments created successfully
- ✅ No mock/local waybills
- ✅ No errors in console

If you see any issues, check the browser console for the exact error message and share it!
