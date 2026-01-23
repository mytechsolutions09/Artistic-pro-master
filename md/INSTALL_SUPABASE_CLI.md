# Install Supabase CLI on Windows

## ❌ Problem:
- `npm install -g supabase` doesn't work (not supported)
- Scoop not installed

## ✅ Solutions (Choose One):

---

## **Option 1: Install Scoop First, Then Supabase CLI** (Recommended)

### Step 1: Install Scoop
Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

### Step 2: Install Supabase CLI
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 3: Verify Installation
```powershell
supabase --version
```

---

## **Option 2: Use npx (No Installation Needed)**

You can run Supabase commands directly with `npx`:

```powershell
# Check if logged in
npx supabase@latest projects list

# Login
npx supabase@latest login

# Link project
npx supabase@latest link --project-ref varduayfdqivaofymfov

# Deploy function
npx supabase@latest functions deploy delhivery-api --no-verify-jwt

# Set secret
npx supabase@latest secrets set DELHIVERY_API_TOKEN=your_token_here

# Check logs
npx supabase@latest functions logs delhivery-api --tail
```

**Note:** Using `npx` will download Supabase CLI each time, but works immediately.

---

## **Option 3: Download Windows Binary**

### Step 1: Download
Go to: https://github.com/supabase/cli/releases

Download: `supabase_windows_amd64.zip`

### Step 2: Extract and Add to PATH
1. Extract the ZIP file
2. Move `supabase.exe` to a folder like `C:\Program Files\Supabase\`
3. Add that folder to your Windows PATH environment variable

### Step 3: Restart PowerShell and Test
```powershell
supabase --version
```

---

## **Option 4: Use Supabase Dashboard (Manual)**

If you prefer not to use CLI:

1. Go to: https://supabase.com/dashboard/project/varduayfdqivaofymfov
2. Click on **"Edge Functions"** in sidebar
3. Click **"Deploy new function"**
4. Upload the folder: `supabase/functions/delhivery-api/`
5. Set secrets in **Project Settings → API → Secrets**

---

## 🎯 Recommended: Use npx (Quickest)

Just run these commands with `npx`:

```powershell
# 1. Login to Supabase
npx supabase@latest login

# 2. Link to your project
npx supabase@latest link --project-ref varduayfdqivaofymfov

# 3. Deploy the Edge Function
npx supabase@latest functions deploy delhivery-api --no-verify-jwt

# 4. Set Delhivery API Token
npx supabase@latest secrets set DELHIVERY_API_TOKEN=your_token_here

# 5. Verify
npx supabase@latest functions list
```

This will work right away without installing anything!

---

## 📋 Quick Test

After deploying, test if it works:

```powershell
# Check logs
npx supabase@latest functions logs delhivery-api --tail
```

Then refresh your admin panel and try creating a warehouse. The 404 error should be gone!

---

**Choose Option 2 (npx) if you want to deploy immediately without installing Scoop!**

