# Windows Deployment Guide for Razorpay Production

## 📍 Where to Run the Scripts

### Your Current Location
```powershell
H:\site\Artistic-pro-master
```

**This is correct!** Run all commands from this directory.

## 🚀 Deployment Options for Windows

### Option 1: PowerShell (Recommended for Windows)

**Step 1: Open PowerShell in Your Project Folder**

```powershell
# You're already here!
cd H:\site\Artistic-pro-master

# Verify you're in the right place
dir deploy-razorpay-production.ps1
```

**Step 2: Run the PowerShell Script**

```powershell
# Run deployment
.\deploy-razorpay-production.ps1
```

**If you get "execution policy" error:**
```powershell
# Allow script execution (one time)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Then run the script
.\deploy-razorpay-production.ps1
```

### Option 2: Git Bash (Alternative)

**Step 1: Open Git Bash**

```bash
# Right-click in your project folder
# Select "Git Bash Here"

# Or navigate to it
cd /h/site/Artistic-pro-master
```

**Step 2: Run the Bash Script**

```bash
# Make it executable
chmod +x deploy-razorpay-production.sh

# Run it
./deploy-razorpay-production.sh
```

### Option 3: Manual Commands (Step-by-Step)

If scripts don't work, run these commands manually in PowerShell:

```powershell
# 1. Check if Supabase CLI is installed
supabase --version

# If not installed:
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link your project (replace with your project ref)
supabase link --project-ref your-project-ref

# 4. Set secrets (replace with your keys)
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_live_secret_key

# 5. Deploy functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

## 📋 Pre-Deployment Checklist

Before running the script, make sure:

- [ ] You're in the project directory: `H:\site\Artistic-pro-master`
- [ ] Node.js is installed: `node --version`
- [ ] Supabase CLI is installed: `supabase --version`
- [ ] You have your Razorpay live keys ready
- [ ] You have your Supabase project reference

## 🔍 Finding Your Information

### Supabase Project Reference

1. Go to https://app.supabase.com/
2. Select your project
3. Look at the URL: `https://app.supabase.com/project/[YOUR-PROJECT-REF]`
4. The `[YOUR-PROJECT-REF]` is what you need

Example: If URL is `https://app.supabase.com/project/abcdefghijklmnop`  
Your project ref is: `abcdefghijklmnop`

### Razorpay Live Keys

1. Go to https://dashboard.razorpay.com/
2. **Toggle to "Live Mode"** (top right)
3. Go to **Settings** → **API Keys**
4. Click **"Generate Live Keys"** if you don't have them
5. Copy both:
   - Key ID: `rzp_live_XXXXXXXXXXXXX`
   - Key Secret: `your_secret_key`

## 🎯 What the Script Does

When you run the deployment script, it will:

1. ✅ Check if Supabase CLI is installed
2. ✅ Verify you're logged in
3. ✅ Link to your Supabase project
4. ✅ Set Razorpay credentials as secrets
5. ✅ Deploy Edge Functions to Supabase
6. ✅ Show you next steps

## 📝 Step-by-Step Manual Process

If you prefer to do it manually:

### Step 1: Install Supabase CLI (if needed)

```powershell
npm install -g supabase
```

### Step 2: Login

```powershell
supabase login
```

This will open your browser for authentication.

### Step 3: Link Project

```powershell
supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your actual project reference.

### Step 4: Set Environment Variables

```powershell
supabase secrets set RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
supabase secrets set RAZORPAY_KEY_SECRET=your_secret_key
```

Replace with your actual Razorpay credentials.

### Step 5: Deploy Functions

```powershell
# Deploy both functions
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
```

Or deploy all at once:
```powershell
supabase functions deploy
```

### Step 6: Verify Deployment

```powershell
# Check if functions are deployed
supabase functions list

# View logs
supabase functions logs create-razorpay-order
```

## 🎬 Quick Start (TL;DR)

```powershell
# 1. Open PowerShell in project folder
cd H:\site\Artistic-pro-master

# 2. Run deployment script
.\deploy-razorpay-production.ps1

# 3. Follow the prompts
# - Enter Supabase project ref
# - Enter Razorpay key ID
# - Enter Razorpay key secret

# 4. Done! ✓
```

## ❓ Troubleshooting

### Error: "supabase: command not found"

**Solution:**
```powershell
npm install -g supabase
```

### Error: "Cannot run script"

**Solution:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy-razorpay-production.ps1
```

### Error: "Not logged in to Supabase"

**Solution:**
```powershell
supabase login
```

### Error: "Project not found"

**Solution:**
- Verify your project reference is correct
- Check you're using the right Supabase account
- Try linking again: `supabase link --project-ref your-ref`

## 📍 Directory Structure

Your project should look like this:

```
H:\site\Artistic-pro-master\
│
├── supabase/
│   └── functions/
│       ├── create-razorpay-order/
│       │   └── index.ts
│       └── verify-razorpay-payment/
│           └── index.ts
│
├── src/
│   └── services/
│       ├── razorpayService.ts (current - test mode)
│       └── razorpayService.production.ts (new - production)
│
├── deploy-razorpay-production.sh (for Git Bash)
├── deploy-razorpay-production.ps1 (for PowerShell) ← Use this!
├── package.json
└── ... other files
```

## ✅ After Deployment

After successful deployment, you need to:

### 1. Update Frontend Service

```powershell
# Backup test version
Move-Item src\services\razorpayService.ts src\services\razorpayService.test.ts.bak

# Use production version
Move-Item src\services\razorpayService.production.ts src\services\razorpayService.ts
```

### 2. Update .env File

Open your `.env` file and update:

```env
# Change this line to your LIVE key
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX

# DO NOT add the secret key here!
# Secrets stay in Supabase backend only
```

### 3. Rebuild and Deploy

```powershell
# Build
npm run build

# Deploy (your deployment command)
# Example for Netlify:
netlify deploy --prod

# Example for Vercel:
vercel --prod
```

### 4. Test

1. Go to your production site
2. Add item to cart
3. Go to checkout
4. Complete payment with ₹1
5. Verify in Razorpay dashboard

## 🎓 Summary

**Run from:** `H:\site\Artistic-pro-master` (you're already here!)

**Use:** `.\deploy-razorpay-production.ps1` (PowerShell script)

**Or:** `./deploy-razorpay-production.sh` (Git Bash)

**Or:** Manual commands (step-by-step)

**Time:** ~15 minutes

**Result:** Production-ready Razorpay integration! 🚀

## 🆘 Need Help?

If you're stuck:

1. Check you're in the right directory: `H:\site\Artistic-pro-master`
2. Verify Supabase CLI is installed: `supabase --version`
3. Make sure you're logged in: `supabase projects list`
4. Check the troubleshooting section above
5. Read the error message carefully

## 📞 Quick Reference

```powershell
# Check current directory
pwd

# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref abc123

# Deploy
.\deploy-razorpay-production.ps1

# View logs
supabase functions logs create-razorpay-order
```

---

**You're in the right place! Just run the PowerShell script from where you are.** ✨

