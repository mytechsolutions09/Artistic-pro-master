# Setting Up Delhivery API Token

## ⚠️ Security Note
Your API token is sensitive information. It should be stored in Supabase Edge Function secrets, NOT in frontend code or environment variables that are exposed to the browser.

## ✅ Step 1: Set Token in Supabase Secrets (REQUIRED)

The Edge Function uses this secret to make API calls. This is the **correct and secure** way to configure it.

### Option A: Using Supabase CLI (Recommended)

```powershell
# Make sure you're logged in
npx supabase@latest login

# Link to your project (if not already linked)
npx supabase@latest link --project-ref varduayfdqivaofymfov

# Set the secret (use your actual token)
npx supabase@latest secrets set DELHIVERY_API_TOKEN=d69d7c5a886a898e0975c1d4b14d112185b8c17a
```

### Option B: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/varduayfdqivaofymfov
2. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
3. Click **"Add new secret"**
4. Set:
   - **Name:** `DELHIVERY_API_TOKEN`
   - **Value:** `d69d7c5a886a898e0975c1d4b14d112185b8c17a`
5. Click **"Save"**

## ✅ Step 2: Verify Secret is Set

```powershell
npx supabase@latest secrets list
```

You should see `DELHIVERY_API_TOKEN` in the list.

## ✅ Step 3: Redeploy Edge Function (if needed)

After setting the secret, redeploy the Edge Function to ensure it picks up the new token:

```powershell
npx supabase@latest functions deploy delhivery-api
```

## 📝 Step 4: Optional - Local Development (.env file)

For local development/testing, you can also add it to your `.env` file (but this is optional since the Edge Function uses the Supabase secret):

```env
# Optional - only for local development
VITE_DELHIVERY_API_TOKEN=d69d7c5a886a898e0975c1d4b14d112185b8c17a
```

**Note:** The `VITE_` prefix means this will be exposed to the browser. The Edge Function uses the Supabase secret instead, which is more secure.

## 🧪 Step 5: Test the Configuration

1. Go to Admin → Shipping
2. Try to create a shipment or request a pickup
3. Check the browser console - you should see real API calls (not mock data)
4. Check Edge Function logs:
   ```powershell
   npx supabase@latest functions logs delhivery-api --tail
   ```

## 🔍 Troubleshooting

### If you still get 401 errors:

1. **Verify token is correct:**
   - Token should be exactly: `d69d7c5a886a898e0975c1d4b14d112185b8c17a`
   - No extra spaces
   - No "Token " prefix

2. **Check Edge Function logs:**
   ```powershell
   npx supabase@latest functions logs delhivery-api --tail
   ```
   Look for: `🔑 Token preview: d69d...c17a`

3. **Verify secret is set:**
   ```powershell
   npx supabase@latest secrets list
   ```

4. **Redeploy Edge Function:**
   ```powershell
   npx supabase@latest functions deploy delhivery-api
   ```

## ✅ Current Token Configuration

- **Token:** `d69d7c5a886a898e0975c1d4b14d112185b8c17a`
- **Length:** 40 characters
- **Status:** Ready to configure in Supabase secrets

## 🔒 Security Best Practices

1. ✅ Store token in Supabase Edge Function secrets (not in frontend code)
2. ✅ Never commit tokens to git
3. ✅ Use different tokens for staging and production
4. ✅ Rotate tokens periodically
5. ⚠️ If this token was exposed, consider generating a new one from Delhivery dashboard
