# Set MSG91 Secrets - Quick Guide

## ✅ Function Deployed Successfully!

Your Edge Function `send-otp-msg91` has been deployed to Supabase!

---

## 🔐 Now Set Your MSG91 Secrets

You need to configure 3 environment variables for the Edge Function.

### Step 1: Get Your MSG91 Credentials

1. **Login to MSG91 Dashboard:** https://control.msg91.com/
2. **Get Auth Key:**
   - Go to: Settings → API Keys
   - Copy your **Auth Key**

3. **Get Template ID:**
   - Go to: SMS → Templates
   - Find your OTP template
   - Copy the **Template ID**

4. **Sender ID:**
   - For testing: Use `MSGIND` (default)
   - For production: Your custom sender ID (if approved)

---

### Step 2: Set Secrets in Supabase

Run these commands in PowerShell (replace with your actual values):

```powershell
# Set MSG91 Auth Key
npx supabase secrets set MSG91_AUTH_KEY=your-actual-auth-key-here

# Set Sender ID (use MSGIND for now)
npx supabase secrets set MSG91_SENDER_ID=MSGIND

# Set Template ID
npx supabase secrets set MSG91_TEMPLATE_ID=your-template-id-here
```

---

### Step 3: Verify Secrets

```powershell
npx supabase secrets list
```

You should see:
- MSG91_AUTH_KEY
- MSG91_SENDER_ID
- MSG91_TEMPLATE_ID

---

## 📝 Example Command

If your credentials are:
- Auth Key: `abc123xyz456`
- Template ID: `123456789012345678901234`

Then run:
```powershell
npx supabase secrets set MSG91_AUTH_KEY=abc123xyz456
npx supabase secrets set MSG91_SENDER_ID=MSGIND
npx supabase secrets set MSG91_TEMPLATE_ID=123456789012345678901234
```

---

## 🎯 After Setting Secrets

1. ✅ Secrets are configured
2. ✅ Edge Function is deployed
3. ⏳ Next: Run database setup SQL
4. ⏳ Next: Update .env file
5. ⏳ Next: Test phone authentication

---

## 🐛 Troubleshooting

### Can't find Auth Key?
- Login to MSG91
- Go to: Settings → API Keys
- If no key exists, click "Generate Auth Key"

### Don't have Template ID?
- Go to: SMS → Templates
- Click "Create Template"
- Choose "OTP" template type
- Enter message: `Your verification code is ##OTP##. Valid for 5 minutes.`
- Submit for approval
- Copy Template ID once approved

### Sender ID?
- For testing: Always use `MSGIND`
- For production: Apply for custom sender ID (requires KYC)

---

## 📚 Next Steps

After setting secrets:

1. **Run Database Setup:**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `setup_msg91_phone_auth.sql`

2. **Update .env file:**
   ```env
   VITE_MSG91_AUTH_KEY=your-auth-key
   VITE_MSG91_SENDER_ID=MSGIND
   VITE_MSG91_TEMPLATE_ID=your-template-id
   VITE_PHONE_AUTH_ENABLED=true
   VITE_PHONE_AUTH_COUNTRY_CODE=+91
   VITE_PHONE_AUTH_COUNTRY=IN
   ```

3. **Test:**
   ```bash
   npm run dev
   ```

---

## ✨ Quick Reference

| Secret Name | Where to Get | Example |
|-------------|--------------|---------|
| MSG91_AUTH_KEY | Settings → API Keys | abc123xyz456 |
| MSG91_SENDER_ID | Use MSGIND for testing | MSGIND |
| MSG91_TEMPLATE_ID | SMS → Templates | 123456789012345678901234 |

---

**Ready?** Set your secrets and continue to the next step! 🚀

