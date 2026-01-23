# 🚀 Deploy Delhivery Edge Function NOW

## ❌ Error You're Seeing:
```
POST https://varduayfdqivaofymfov.supabase.co/functions/v1/delhivery-api 404 (Not Found)
```

**Reason:** The Edge Function hasn't been deployed yet!

---

## ✅ Quick Fix (3 Steps):

### Step 1: Login to Supabase
```bash
supabase login
```

### Step 2: Link to Your Project
```bash
supabase link --project-ref varduayfdqivaofymfov
```

### Step 3: Deploy the Edge Function
```bash
supabase functions deploy delhivery-api --no-verify-jwt
```

---

## 🔑 Set Your API Token

After deployment, set your Delhivery API token:

```bash
supabase secrets set DELHIVERY_API_TOKEN=your_actual_token_here
```

---

## ✅ Verify Deployment

Check if the function is deployed:
```bash
supabase functions list
```

You should see `delhivery-api` in the list.

---

## 🧪 Test the Function

```bash
# Test with a simple request
curl -X POST https://varduayfdqivaofymfov.supabase.co/functions/v1/delhivery-api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "action": "/client-warehouse/create/",
    "method": "POST",
    "endpoint": "ltl",
    "data": {}
  }'
```

If you get a response (even an error from Delhivery), the function is working!

---

## 📋 Complete Deployment Checklist

Run these commands in order:

```powershell
# 1. Login (if not already)
supabase login

# 2. Link to your project
supabase link --project-ref varduayfdqivaofymfov

# 3. Deploy the function
supabase functions deploy delhivery-api --no-verify-jwt

# 4. Set Delhivery token
supabase secrets set DELHIVERY_API_TOKEN=your_token_here

# 5. Verify deployment
supabase functions list

# 6. Check logs
supabase functions logs delhivery-api --tail
```

---

## 🔍 If Still Getting 404:

### Check Project Reference
Your project ref is: `varduayfdqivaofymfov`

Make sure you're deploying to the correct project:
```bash
supabase projects list
```

### Check Function Name
The function must be named exactly `delhivery-api` (match the folder name):
```
supabase/
  functions/
    delhivery-api/    ← Must match this name
      index.ts
```

### Redeploy if Needed
```bash
supabase functions delete delhivery-api
supabase functions deploy delhivery-api --no-verify-jwt
```

---

## 🎯 After Successful Deployment

1. Refresh your admin panel
2. Try creating a warehouse
3. Check browser console - should see:
   ```
   📡 Calling Delhivery via Supabase Edge Function
   ```
4. Check Edge Function logs:
   ```bash
   supabase functions logs delhivery-api --tail
   ```

---

## 📞 Need Help?

If deployment fails, check:
1. Supabase CLI is installed: `supabase --version`
2. You're logged in: `supabase projects list`
3. Function file exists: `supabase/functions/delhivery-api/index.ts`
4. No syntax errors in the Edge Function code

---

**Run this now and the 404 will be fixed!** 🚀

