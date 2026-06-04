# Manual Deployment Steps (Windows)

If the automated script doesn't work, follow these **simple manual steps** in PowerShell:

## 📍 Location

Make sure you're in your project directory:
```powershell
cd H:\site\Artistic-pro-master
```

## 🚀 Step-by-Step Commands

### Step 1: Install Supabase CLI

**⚠️ Important:** `npm install -g supabase` no longer works!

**Choose one method:**

#### **Option A: Use npx (No Installation - Quick & Easy)**
```powershell
# No installation needed! Just add 'npx' before every 'supabase' command
# Example: npx supabase login
```

#### **Option B: Install via Scoop (Recommended)**
```powershell
# Install Scoop first
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**See:** `INSTALL_SUPABASE_CLI_WINDOWS.md` for all installation methods

### Step 2: Login to Supabase

**If using npx:**
```powershell
npx supabase login
```

**If installed via Scoop:**
```powershell
supabase login
```

This will open your browser. Login and authorize.

### Step 3: Get Your Project Reference

1. Go to https://app.supabase.com/
2. Select your project
3. Look at the URL: `https://app.supabase.com/project/[YOUR-PROJECT-REF]`
4. Copy the `[YOUR-PROJECT-REF]` part

Example: If URL is `https://app.supabase.com/project/abcdefghijklmnop`  
Your project ref is: `abcdefghijklmnop`

### Step 4: Link Your Project

**If using npx:**
```powershell
npx supabase link --project-ref YOUR-PROJECT-REF
```

**If installed via Scoop:**
```powershell
supabase link --project-ref YOUR-PROJECT-REF
```

Replace `YOUR-PROJECT-REF` with your actual project reference.

Example:
```powershell
npx supabase link --project-ref abcdefghijklmnop
```

### Step 5: Get Your Razorpay Keys

1. Go to https://dashboard.razorpay.com/
2. **Switch to "Live Mode"** (toggle at top)
3. Go to **Settings** → **API Keys**
4. Click **"Generate Live Keys"** if you don't have them
5. Copy both keys

### Step 6: Set Razorpay Secrets

**If using npx:**
```powershell
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
npx supabase secrets set RAZORPAY_KEY_SECRET=your_actual_secret_key
```

**If installed via Scoop:**
```powershell
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_actual_secret_key
```

Replace with your actual Razorpay live keys.

### Step 7: Deploy Edge Functions

**If using npx:**
```powershell
npx supabase functions deploy
```

**If installed via Scoop:**
```powershell
supabase functions deploy
```

This deploys both functions at once!

### Step 8: Verify Deployment

**If using npx:**
```powershell
npx supabase functions list
```

**If installed via Scoop:**
```powershell
supabase functions list
```

You should see both functions listed.

## ✅ After Deployment

### Update Your Frontend Code

#### 1. Backup Test Version

```powershell
Move-Item src\services\razorpayService.ts src\services\razorpayService.test.ts.bak -Force
```

#### 2. Use Production Version

```powershell
Move-Item src\services\razorpayService.production.ts src\services\razorpayService.ts -Force
```

#### 3. Update .env File

Open your `.env` file and update:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
```

Replace with your actual live key ID.

**Important:** DO NOT add `VITE_RAZORPAY_KEY_SECRET` to .env!  
The secret stays in Supabase backend only.

#### 4. Build and Deploy

```powershell
# Build
npm run build

# Deploy (use your deployment command)
# Example:
# netlify deploy --prod
# or
# vercel --prod
```

## 🎯 Test

1. Go to your production site
2. Add an item to cart
3. Go to checkout
4. Complete a payment with ₹1
5. Verify in Razorpay dashboard

## 📊 Monitor

View function logs:
```powershell
supabase functions logs create-razorpay-order
```

Or follow logs in real-time:
```powershell
supabase functions logs create-razorpay-order --follow
```

## ❓ Troubleshooting

### "supabase: command not found"

**Solution:**
```powershell
npm install -g supabase
```

Restart PowerShell after installation.

### "Not logged in"

**Solution:**
```powershell
supabase login
```

### "Project not found"

**Solution:**
- Double-check your project reference
- Make sure you copied it correctly from the URL
- Try listing projects: `supabase projects list`

### "Failed to deploy function"

**Solution:**
- Check the error message
- Verify function files exist in `supabase/functions/`
- Try deploying one at a time
- Check function logs: `supabase functions logs create-razorpay-order`

## 📋 Complete Example

Here's a complete example with sample values:

```powershell
# 1. Navigate to project
cd H:\site\Artistic-pro-master

# 2. Install Supabase CLI (if needed)
npm install -g supabase

# 3. Login
supabase login

# 4. Link project (example ref)
supabase link --project-ref abcdefghijklmnop

# 5. Set Razorpay key ID (example)
supabase secrets set RAZORPAY_KEY_ID=rzp_live_ABC123XYZ456

# 6. Set Razorpay secret (example)
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key_here

# 7. Deploy functions
supabase functions deploy

# 8. Verify
supabase functions list

# 9. Update frontend
Move-Item src\services\razorpayService.ts src\services\razorpayService.test.ts.bak -Force
Move-Item src\services\razorpayService.production.ts src\services\razorpayService.ts -Force

# 10. Update .env (open in editor and change the key)
# VITE_RAZORPAY_KEY_ID=rzp_live_ABC123XYZ456

# 11. Build and deploy
npm run build
# (your deployment command)
```

## 🎉 Done!

Your Razorpay production integration is now live!

Test with a small amount (₹1) first, then go live with confidence. 🚀

## 🆘 Still Having Issues?

If manual steps don't work:

1. Check `WINDOWS_DEPLOYMENT_GUIDE.md`
2. Read `RAZORPAY_PRODUCTION_MIGRATION.md`
3. Review error messages carefully
4. Check Supabase dashboard
5. Check Razorpay dashboard

## 📞 Support Resources

- [Supabase Docs](https://supabase.com/docs/guides/functions)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Supabase Dashboard](https://app.supabase.com/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)

