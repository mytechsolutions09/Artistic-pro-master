# Debugging Delhivery 401 Authentication Error

## Quick Fix Checklist

### Step 1: Check if Edge Function is Deployed
```bash
supabase functions list
```
You should see `delhivery-api` in the list.

### Step 2: Check if Token is Set in Supabase
```bash
supabase secrets list
```
You should see `DELHIVERY_API_TOKEN` in the list.

### Step 3: Set/Update Your Token

**Get your Delhivery token first:**
1. Login to: https://account.delhivery.com/
2. Go to API Settings
3. Copy your API token (looks like: `8f5d1234567890abcdef1234567890ab`)

**Set it in Supabase:**
```bash
# Replace YOUR_ACTUAL_TOKEN with your real token
supabase secrets set DELHIVERY_API_TOKEN=YOUR_ACTUAL_TOKEN
```

**IMPORTANT:** 
- Use ONLY the token value (no "Token " prefix)
- Don't include quotes
- Make sure there are no extra spaces

Example (correct):
```bash
supabase secrets set DELHIVERY_API_TOKEN=8f5d1234567890abcdef1234567890ab
```

Example (wrong):
```bash
supabase secrets set DELHIVERY_API_TOKEN="Token 8f5d1234567890abcdef1234567890ab"  # ❌ Wrong
supabase secrets set DELHIVERY_API_TOKEN=Token 8f5d1234567890abcdef1234567890ab    # ❌ Wrong
```

### Step 4: Redeploy Edge Function After Setting Token
```bash
supabase functions deploy delhivery-api --no-verify-jwt
```

### Step 5: Verify Token Works
Test directly with curl:
```bash
# Replace YOUR_TOKEN with your actual token
curl -X POST https://staging-express.delhivery.com/c/api/pin-codes/json/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filter_codes": "110001"}'
```

If you get data back (not 401), your token is valid.

---

## Common Issues & Solutions

### Issue 1: Using Wrong Environment
**Symptom:** Token works locally but fails in production

**Solution:** Check if you're using the right token for the right environment:
- **Staging:** Use staging token with `https://staging-express.delhivery.com`
- **Production:** Use production token with `https://express.delhivery.com`

Update Edge Function if needed (line 37-44 in `supabase/functions/delhivery-api/index.ts`).

### Issue 2: Token Expired or Revoked
**Symptom:** Was working before, suddenly getting 401

**Solution:** 
1. Generate a new token from Delhivery dashboard
2. Update the secret: `supabase secrets set DELHIVERY_API_TOKEN=NEW_TOKEN`

### Issue 3: Wrong Token Format
**Symptom:** Always getting 401

**Check:** Your token should be a long alphanumeric string (32-64 characters)
- ✅ Correct: `8f5d1234567890abcdef1234567890ab`
- ❌ Wrong: `Token 8f5d...` (has "Token " prefix)
- ❌ Wrong: `"8f5d..."` (has quotes)

### Issue 4: Edge Function Not Finding Token
**Symptom:** Getting "Delhivery API token not configured" error

**Solution:**
```bash
# Check current secrets
supabase secrets list

# If not set, set it:
supabase secrets set DELHIVERY_API_TOKEN=YOUR_TOKEN

# Redeploy
supabase functions deploy delhivery-api --no-verify-jwt
```

---

## Testing Your Setup

### Test 1: Check Edge Function Logs
```bash
supabase functions logs delhivery-api --tail
```

Then try an operation from admin panel. You should see:
```
🔔 Incoming request to delhivery-api Edge Function
📦 Delhivery API Request: POST https://staging-express.delhivery.com/...
✅ Delhivery API Response Status: 200
```

If you see `401` in the response status, the token is wrong.

### Test 2: Test from Browser Console
Open your admin panel and run in browser console:
```javascript
const { data, error } = await supabase.functions.invoke('delhivery-api', {
  body: {
    action: '/c/api/pin-codes/json/',
    method: 'POST',
    data: { filter_codes: '110001' },
    endpoint: 'main'
  }
});
console.log('Result:', data);
console.log('Error:', error);
```

### Test 3: Verify Token Directly
Test your token directly against Delhivery:

**PowerShell:**
```powershell
$headers = @{
    "Authorization" = "Token YOUR_ACTUAL_TOKEN"
    "Content-Type" = "application/json"
}
$body = @{
    filter_codes = "110001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://staging-express.delhivery.com/c/api/pin-codes/json/" `
    -Method Post -Headers $headers -Body $body
```

**Bash:**
```bash
curl -X POST https://staging-express.delhivery.com/c/api/pin-codes/json/ \
  -H "Authorization: Token YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filter_codes": "110001"}'
```

If this returns data (not 401), your token is valid and the issue is in the Edge Function setup.

---

## Full Reset (Nuclear Option)

If nothing works, do a complete reset:

```bash
# 1. Delete existing function
supabase functions delete delhivery-api

# 2. Delete all secrets
supabase secrets unset DELHIVERY_API_TOKEN

# 3. Set token fresh
supabase secrets set DELHIVERY_API_TOKEN=YOUR_NEW_TOKEN

# 4. Deploy function fresh
supabase functions deploy delhivery-api --no-verify-jwt

# 5. Check logs
supabase functions logs delhivery-api --tail
```

---

## Still Not Working?

### Check These:

1. **Are you logged into the right Supabase project?**
   ```bash
   supabase projects list
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. **Is your Delhivery account active?**
   - Login to Delhivery dashboard
   - Check if your account has API access enabled
   - Verify billing/subscription status

3. **Are you using the correct API endpoint?**
   - Staging: `https://staging-express.delhivery.com`
   - Production: `https://express.delhivery.com`

4. **Network issues?**
   - Try from a different network
   - Check if Delhivery API is having issues
   - Try a different Delhivery endpoint

---

## Contact Delhivery Support

If your token tests successfully with curl but fails through the Edge Function:

1. Verify with Delhivery that your API access is active
2. Ask them to check if your IP/requests are being blocked
3. Confirm you're using the correct authentication format

**Delhivery Support:**
- Email: support@delhivery.com
- Dashboard: https://account.delhivery.com/support

