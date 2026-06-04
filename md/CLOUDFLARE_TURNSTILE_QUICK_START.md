# Cloudflare Turnstile - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Create Widget (2 minutes)
```
1. Go to: https://dash.cloudflare.com/
2. Click: Turnstile (left sidebar)
3. Click: "Add Site" button
4. Fill in the form ⬇️
```

### Step 2: Widget Configuration Form

```
┌─────────────────────────────────────────────────┐
│  Cloudflare Turnstile - Add Site                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Hostname Management                            │
│  ┌───────────────────────────────────────────┐ │
│  │ yourdomain.com, localhost                 │ │
│  └───────────────────────────────────────────┘ │
│  💡 Add both production and development        │
│                                                 │
│  Widget Mode                                    │
│  ● Managed          ← SELECT THIS              │
│  ○ Non-Interactive                              │
│  ○ Invisible                                    │
│                                                 │
│  Pre-clearance                                  │
│  ☐ Enable pre-clearance  ← LEAVE UNCHECKED     │
│                                                 │
│  [ Create ]                                     │
└─────────────────────────────────────────────────┘
```

### Step 3: Copy Your Keys (1 minute)

After clicking "Create", you'll see:

```
┌─────────────────────────────────────────────────┐
│  Your Turnstile Widget                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Site Key (Public)                              │
│  ┌───────────────────────────────────────────┐ │
│  │ 0x4AAAAAABbbbbCCCCddddEEEE       [Copy] │ │
│  └───────────────────────────────────────────┘ │
│  ✅ Safe to use in frontend                     │
│                                                 │
│  Secret Key (Private)                           │
│  ┌───────────────────────────────────────────┐ │
│  │ 0x4AAAAAABbbbbCCCCddddFFFF...    [Copy] │ │
│  └───────────────────────────────────────────┘ │
│  ⚠️  Keep this secret!                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Action**: Click [Copy] for both keys

### Step 4: Add to .env (1 minute)

Open your `.env` file and paste:

```env
# Cloudflare Turnstile
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAABbbbbCCCCddddEEEE
VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAABbbbbCCCCddddFFFFggggg
VITE_CLOUDFLARE_TURNSTILE_THEME=light
VITE_CLOUDFLARE_TURNSTILE_ENABLED=true
```

### Step 5: Restart & Test (1 minute)

```bash
# Stop your dev server (Ctrl+C)
# Start again
npm run dev

# Visit login page
http://localhost:5173/sign-in
```

**✅ Done!** You should see the Turnstile widget on your login page!

---

## 🎯 What Each Setting Means

### Hostnames
```
yourdomain.com    → Production website
localhost         → Local development
```

### Widget Modes

| Mode | What User Sees | When to Use |
|------|---------------|-------------|
| **Managed** ⭐ | Checkbox or nothing | **RECOMMENDED** - Best balance |
| **Non-Interactive** | Loading bar | Want visible security |
| **Invisible** | Nothing at all | Zero friction UX |

### Pre-clearance

| Setting | Meaning | Recommendation |
|---------|---------|----------------|
| **Unchecked** ⭐ | Each session verified independently | **RECOMMENDED** |
| **Checked** | Share verification across Cloudflare domains | Only if needed |

---

## 📱 Visual Guide

### What Users Will See

#### Managed Mode (Recommended)
```
┌─────────────────────────────┐
│         Login Form          │
├─────────────────────────────┤
│  Email: [_______________]   │
│  Password: [___________]    │
│                             │
│  ┌─────────────────────┐   │
│  │ ☑ I'm human         │   │  ← Turnstile Widget
│  └─────────────────────┘   │
│                             │
│  [  Sign In  ]              │
└─────────────────────────────┘
```

#### Non-Interactive Mode
```
┌─────────────────────────────┐
│         Login Form          │
├─────────────────────────────┤
│  Email: [_______________]   │
│  Password: [___________]    │
│                             │
│  ┌─────────────────────┐   │
│  │ Verifying...        │   │  ← Turnstile Widget
│  │ ████████░░░░░░░░    │   │     (Loading bar)
│  └─────────────────────┘   │
│                             │
│  [  Sign In  ]              │
└─────────────────────────────┘
```

#### Invisible Mode
```
┌─────────────────────────────┐
│         Login Form          │
├─────────────────────────────┤
│  Email: [_______________]   │
│  Password: [___________]    │
│                             │
│  (No visible widget)        │  ← Completely invisible
│                             │
│  [  Sign In  ]              │
└─────────────────────────────┘
```

---

## ✅ Verification Checklist

After setup, verify everything works:

### Test 1: Widget Appears
- [ ] Visit `/sign-in` page
- [ ] See Turnstile widget
- [ ] Widget loads without errors

### Test 2: Successful Login
- [ ] Complete Turnstile verification
- [ ] Enter credentials
- [ ] Click "Sign In"
- [ ] Login succeeds ✅

### Test 3: Missing Verification
- [ ] Refresh page
- [ ] Skip Turnstile
- [ ] Try to login
- [ ] See error: "Please complete the security verification" ✅

### Test 4: Different Browsers
- [ ] Test on Chrome
- [ ] Test on Firefox  
- [ ] Test on Safari
- [ ] Test on mobile

---

## 🔧 Troubleshooting

### Widget Not Showing?

**Check 1**: Environment variables loaded?
```bash
# Restart dev server
npm run dev
```

**Check 2**: Keys correct in `.env`?
```env
# Should look like:
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAA...
```

**Check 3**: Hostname added to Cloudflare?
```
In Cloudflare Dashboard:
Turnstile → Your Widget → Edit → Add "localhost"
```

### "Invalid Site Key" Error?

**Fix**: Copy the Site Key again from Cloudflare Dashboard
- Make sure no extra spaces
- Key should start with `0x4...`

### Widget Shows But Login Fails?

**Fix**: Check browser console (F12)
- Look for JavaScript errors
- Verify Turnstile script loaded

---

## 🎨 Customization

### Change Theme

```env
# Light theme (default)
VITE_CLOUDFLARE_TURNSTILE_THEME=light

# Dark theme
VITE_CLOUDFLARE_TURNSTILE_THEME=dark

# Auto-detect
VITE_CLOUDFLARE_TURNSTILE_THEME=auto
```

### Disable Temporarily

```env
# To disable without removing code
VITE_CLOUDFLARE_TURNSTILE_ENABLED=false
```

---

## 📊 Monitor Performance

### Cloudflare Dashboard

Check your widget performance:
```
1. Go to: dash.cloudflare.com
2. Click: Turnstile
3. Click: Your widget name
4. View: Analytics & Stats
```

**You'll see**:
- Total verifications
- Success rate
- Challenge rate
- Regional distribution

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Updated hostnames in Cloudflare (remove localhost, add yourdomain.com)
- [ ] Added production keys to production `.env`
- [ ] Tested on production domain
- [ ] Verified mobile works
- [ ] Checked different browsers
- [ ] Monitored Cloudflare analytics

---

## 📞 Need Help?

### Quick Fixes

**Problem**: Widget not appearing
**Solution**: Restart dev server, check `.env`

**Problem**: Invalid Site Key
**Solution**: Recopy from Cloudflare Dashboard

**Problem**: Login fails after verification
**Solution**: Check browser console for errors

### Resources

- 📖 Full Setup Guide: `CLOUDFLARE_TURNSTILE_SETUP.md`
- 📋 Widget Creation: `CLOUDFLARE_TURNSTILE_WIDGET_CREATION.md`
- 🌐 Cloudflare Docs: https://developers.cloudflare.com/turnstile/

---

## 🎉 You're Done!

Your login page is now protected by Cloudflare Turnstile!

**Next Steps**:
1. Test thoroughly
2. Monitor analytics
3. Deploy to production
4. Enjoy bot-free logins! 🛡️

---

**Quick Command Reference**

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Test build
npm run preview
```

---

**Environment Variables Quick Copy**

```env
# Copy this to your .env file
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your-site-key-here
VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY=your-secret-key-here
VITE_CLOUDFLARE_TURNSTILE_THEME=light
VITE_CLOUDFLARE_TURNSTILE_ENABLED=true
```

---

**🛡️ Your login is now protected!**

