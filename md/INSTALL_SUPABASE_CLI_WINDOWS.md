# Install Supabase CLI on Windows

## ❌ Why `npm install -g supabase` Doesn't Work

Supabase CLI no longer supports global npm installation. You need to use a package manager.

## ✅ Installation Methods for Windows

### **Option 1: Scoop (Recommended - Easiest)**

#### Step 1: Install Scoop (if you don't have it)

Open PowerShell and run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

#### Step 2: Install Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Step 3: Verify Installation

```powershell
supabase --version
```

You should see the version number!

---

### **Option 2: NPM with npx (No Installation Needed)**

Instead of installing globally, use `npx` to run Supabase commands:

```powershell
# Login
npx supabase login

# Link project
npx supabase link --project-ref YOUR-PROJECT-REF

# Set secrets
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXX
npx supabase secrets set RAZORPAY_KEY_SECRET=your_secret

# Deploy functions
npx supabase functions deploy
```

**Pros:** No installation needed  
**Cons:** Slower (downloads each time)

---

### **Option 3: Chocolatey (Windows Package Manager)**

#### Step 1: Install Chocolatey (if you don't have it)

Open PowerShell as **Administrator** and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### Step 2: Install Supabase CLI

```powershell
choco install supabase
```

#### Step 3: Verify Installation

```powershell
supabase --version
```

---

### **Option 4: Direct Download (Manual)**

#### Step 1: Download Binary

Go to: https://github.com/supabase/cli/releases/latest

Download: `supabase_windows_amd64.zip`

#### Step 2: Extract and Add to PATH

1. Extract the zip file
2. Move `supabase.exe` to a folder (e.g., `C:\supabase\`)
3. Add that folder to your Windows PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" variable
   - Add `C:\supabase\`
   - Click OK

#### Step 3: Restart PowerShell and Verify

```powershell
supabase --version
```

---

## 🚀 **Quick Start After Installation**

Once Supabase CLI is installed, run these commands:

### 1. Login to Supabase
```powershell
supabase login
```

### 2. Link Your Project
```powershell
supabase link --project-ref YOUR-PROJECT-REF
```

### 3. Set Razorpay Secrets
```powershell
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_actual_secret_key
```

### 4. Deploy Functions
```powershell
supabase functions deploy
```

### 5. Verify
```powershell
supabase functions list
```

---

## 🎯 **Recommended Approach for You**

### **Quick: Use npx (No Installation)**

Just add `npx` before every `supabase` command:

```powershell
# Instead of: supabase login
# Use:
npx supabase login

# Instead of: supabase functions deploy
# Use:
npx supabase functions deploy
```

This works immediately without any installation!

### **Best: Install via Scoop**

One-time setup, then use `supabase` commands normally:

```powershell
# Install Scoop
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verify
supabase --version
```

---

## 📋 **Complete Example with npx**

Here's the complete deployment using `npx` (no installation needed):

```powershell
# 1. Navigate to project
cd H:\site\Artistic-pro-master

# 2. Login
npx supabase login

# 3. Link project (replace with your project ref)
npx supabase link --project-ref abcdefghijklmnop

# 4. Set Razorpay secrets (replace with your keys)
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_ABC123XYZ456
npx supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key_here

# 5. Deploy functions
npx supabase functions deploy

# 6. Verify
npx supabase functions list
```

---

## ❓ Troubleshooting

### Error: "command not found" after Scoop install

**Solution:** Restart PowerShell after installation

### Error: "execution policy" with Scoop

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### npx is slow

**Solution:** Install via Scoop for faster execution

---

## 🎉 Summary

**Quick & Easy:** Use `npx supabase` instead of `supabase`  
**Best Long-term:** Install via Scoop  
**Alternative:** Chocolatey or manual download

Choose what works best for you! 🚀

