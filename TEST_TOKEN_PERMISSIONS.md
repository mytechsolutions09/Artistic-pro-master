# Test Token Permissions for Pickup API

## 🎯 Quick Test

Since your warehouse name matches exactly, let's verify if it's a token permissions issue.

### Test 1: Does Token Work for Shipments? ✅ (Probably Yes)

Your token likely works for:
- Creating shipments
- Generating waybills
- Tracking shipments

### Test 2: Does Token Work for Pickups? ❌ (No - 401 Error)

Your token is failing for:
- Pickup requests (`/fm/request/new/`)

**This confirms:** Your token doesn't have pickup permissions.

---

## ✅ Solution: Contact Delhivery Support

### Step 1: Email Delhivery Support

**Email:** support@delhivery.com  
**Subject:** API Token Missing Pickup Permissions - Urgent

**Message:**
```
Hello Delhivery Support Team,

I need help enabling pickup permissions for my API token.

CURRENT SITUATION:
- My API token works perfectly for:
  ✅ Creating shipments (/api/cmu/create.json)
  ✅ Generating waybills (/waybill/api/bulk/json/)
  ✅ Tracking shipments (/api/packages/json/)

- But returns 401 Unauthorized for:
  ❌ Pickup requests (/fm/request/new/)

WAREHOUSE DETAILS:
- Warehouse Name: "Lurevi - Janak puri"
- Warehouse is registered and active in Delhivery dashboard
- Warehouse name matches exactly (case-sensitive)

REQUEST:
Please enable pickup/CMU permissions for my API token so I can schedule pickup requests.

My account details:
- [Your account email/ID]
- [Your account name]

Thank you for your assistance!
```

### Step 2: Wait for Response

Delhivery support typically responds within 24-48 hours. They will either:
- Enable pickup permissions for your existing token
- Provide instructions to generate a new token with pickup permissions

### Step 3: After Permissions Are Enabled

Once Delhivery enables pickup permissions:

1. **Test Pickup Request:**
   - Try scheduling a pickup request again
   - Should work immediately (no code changes needed)

2. **If They Provide a New Token:**
   ```powershell
   # Update token in Supabase
   npx supabase@latest secrets set DELHIVERY_API_TOKEN=your_new_token_here
   
   # Redeploy Edge Function (optional, but recommended)
   npx supabase@latest functions deploy delhivery-api --no-verify-jwt
   ```

---

## 🔍 Why This Happens

Delhivery API tokens can have different permission levels:
- **Basic Token:** Works for shipments, waybills, tracking
- **Full Token:** Works for everything including pickups

Your current token is a "Basic Token" - it works for most operations but not pickups.

---

## 📞 Alternative: Call Delhivery Support

If email is too slow, try calling:
- Check Delhivery dashboard for support phone number
- Explain: "My API token works for shipments but not pickups - need pickup permissions enabled"

---

## ✅ Expected Outcome

After Delhivery enables pickup permissions:
- ✅ Pickup requests will work immediately
- ✅ No code changes needed
- ✅ Same token, just with additional permissions

---

## 🆘 Still Having Issues?

If Delhivery says your token already has pickup permissions:

1. **Double-check warehouse name:**
   - Copy warehouse name directly from Delhivery dashboard
   - Compare character-by-character with your system
   - Check for hidden spaces or special characters

2. **Verify token:**
   - Generate a fresh token in Delhivery dashboard
   - Update in Supabase secrets
   - Redeploy Edge Function

3. **Check warehouse status:**
   - Ensure warehouse is "Active" in Delhivery dashboard
   - Not "Pending" or "Inactive"
