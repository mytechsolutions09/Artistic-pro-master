# Cloudflare Turnstile Widget Creation Guide

## Step-by-Step Instructions to Create Your Turnstile Widget

### Prerequisites
- Active Cloudflare account
- Access to Cloudflare Dashboard
- Your website domain (or use `localhost` for testing)

---

## Step 1: Access Cloudflare Dashboard

1. **Go to Cloudflare**:
   - Visit: https://dash.cloudflare.com/
   - Log in with your Cloudflare account

2. **Navigate to Turnstile**:
   - On the left sidebar, find and click **"Turnstile"**
   - Or directly visit: https://dash.cloudflare.com/?to=/:account/turnstile

---

## Step 2: Create New Widget

1. **Click "Add Site"** or **"Create"** button
   - You'll see a form to configure your Turnstile widget

---

## Step 3: Hostname Configuration

### Hostname Management (0 out of 10 available)

**Option A: Use Your Domain**
```
Enter your domain:
Example: yourdomain.com
         www.yourdomain.com
```

**Option B: For Local Development**
```
For testing locally, you can use:
- localhost
- 127.0.0.1
- *.localhost (wildcard for subdomains)
```

**Important Notes**:
- You can configure up to **10 hostnames** per widget
- Wildcards are supported: `*.yourdomain.com`
- You can add multiple domains separated by commas
- Leave empty for **any domain** (not recommended for production)

**Recommendation for Your Setup**:
```
Production: yourdomain.com, www.yourdomain.com
Development: localhost, 127.0.0.1
```

---

## Step 4: Widget Mode Selection

You have **3 options** - here's what each means:

### 🟢 **Option 1: Managed (RECOMMENDED)**

**Best for**: Most use cases, balanced security & UX

**How it works**:
- ✅ Cloudflare decides if a challenge is needed
- ✅ If suspicious, user checks a box (no puzzles!)
- ✅ If trusted, passes invisibly
- ✅ Adaptive based on threat level

**User sees**:
- Low risk: Nothing or loading indicator
- Medium risk: Simple checkbox to click
- High risk: Checkbox verification

**Recommendation**: ✅ **Choose this for your login page**

```
Select: ● Managed
```

---

### 🔵 **Option 2: Non-Interactive**

**Best for**: Forms where you want visible verification

**How it works**:
- Shows a widget with loading bar
- No user interaction required
- Browser challenge runs in background
- Always visible to user

**User sees**:
- Loading widget during verification
- Completion indicator when done

**Use case**: When you want users to know security check is happening

```
Select: ○ Non-interactive
```

---

### 🟣 **Option 3: Invisible**

**Best for**: Completely seamless experience

**How it works**:
- 100% invisible to users
- No UI element shown
- Runs completely in background
- Best UX, but less visible security

**User sees**:
- Nothing! Completely invisible

**Use case**: When you want zero friction

```
Select: ○ Invisible
```

---

## Step 5: Pre-Clearance Option

### Pre-clearance for this site?

**Question**: "Would you like to opt for pre-clearance for this site?"

**What it means**:
- Issues a clearance cookie
- Acts like user passed a challenge on Cloudflare-proxied site
- Cookie valid for time specified in security settings

**Options**:

**❌ No (RECOMMENDED for most cases)**
```
☐ Enable pre-clearance
```
- Standard behavior
- Each session verified independently
- More secure

**✅ Yes (Only if using Cloudflare proxy)**
```
☑ Enable pre-clearance
```
- Use only if your site is behind Cloudflare proxy
- Shares verification across your Cloudflare-protected domains
- Can reduce repeated challenges

**Recommendation**: ⚠️ **Leave unchecked** unless you specifically need it

---

## Step 6: Complete Widget Configuration

After making your selections, you'll see:

### Summary Screen
```
┌─────────────────────────────────────────┐
│ Widget Configuration                    │
├─────────────────────────────────────────┤
│ Domain: yourdomain.com                  │
│ Mode: Managed                           │
│ Pre-clearance: Disabled                 │
└─────────────────────────────────────────┘
```

**Click "Create" or "Save"**

---

## Step 7: Get Your Keys

After creation, you'll receive:

### Your Turnstile Credentials

1. **Site Key** (Public)
   ```
   Example: 0x4AAAAAABbbbbCCCCddddEEEE
   ```
   - ✅ Safe to expose in frontend
   - ✅ Add to your React app
   - ✅ Visible in page source

2. **Secret Key** (Private)
   ```
   Example: 0x4AAAAAABbbbbCCCCddddFFFFggggg
   ```
   - ⚠️ KEEP PRIVATE
   - ⚠️ Only for backend verification
   - ⚠️ Never expose in frontend

---

## Step 8: Configure Your Application

### Add Keys to `.env` File

```env
# Cloudflare Turnstile Configuration
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=0x4AAAAAABbbbbCCCCddddEEEE
VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAABbbbbCCCCddddFFFFggggg
VITE_CLOUDFLARE_TURNSTILE_THEME=light
VITE_CLOUDFLARE_TURNSTILE_ENABLED=true
```

### Update Theme (Optional)
```env
# Choose one:
VITE_CLOUDFLARE_TURNSTILE_THEME=light  # Light mode (default)
VITE_CLOUDFLARE_TURNSTILE_THEME=dark   # Dark mode
VITE_CLOUDFLARE_TURNSTILE_THEME=auto   # Auto-detect
```

---

## Recommended Configuration for Your Login Page

Based on best practices, here's the optimal setup:

### 🎯 **Recommended Settings**

```
┌────────────────────────────────────────────┐
│ TURNSTILE WIDGET CONFIGURATION             │
├────────────────────────────────────────────┤
│                                            │
│ Hostnames:                                 │
│  Production: yourdomain.com                │
│  Development: localhost                    │
│                                            │
│ Widget Mode: ● Managed                     │
│                                            │
│ Pre-clearance: ☐ Disabled                  │
│                                            │
└────────────────────────────────────────────┘
```

### Why These Settings?

1. **Managed Mode**: 
   - ✅ Best balance of security and UX
   - ✅ Adapts to threat level
   - ✅ Minimal user friction

2. **Pre-clearance Disabled**:
   - ✅ More secure
   - ✅ Independent verification
   - ✅ Simpler setup

3. **Multiple Hostnames**:
   - ✅ Works in development
   - ✅ Works in production
   - ✅ No configuration changes needed

---

## Complete Setup Checklist

- [ ] **Step 1**: Created Cloudflare account
- [ ] **Step 2**: Navigated to Turnstile section
- [ ] **Step 3**: Clicked "Add Site"
- [ ] **Step 4**: Entered hostname (yourdomain.com, localhost)
- [ ] **Step 5**: Selected **Managed** mode
- [ ] **Step 6**: Left pre-clearance **unchecked**
- [ ] **Step 7**: Clicked "Create"
- [ ] **Step 8**: Copied Site Key
- [ ] **Step 9**: Copied Secret Key
- [ ] **Step 10**: Added keys to `.env` file
- [ ] **Step 11**: Set `VITE_CLOUDFLARE_TURNSTILE_ENABLED=true`
- [ ] **Step 12**: Restarted dev server
- [ ] **Step 13**: Tested login page

---

## Testing Your Widget

### 1. **Development Testing**

```bash
# Make sure .env is configured
npm run dev

# Visit login page
http://localhost:5173/sign-in
```

**What to expect**:
- Turnstile widget appears above login button
- May show checkbox or loading indicator
- Completes verification automatically or with one click

### 2. **Verification Test**

**Test Case 1: Complete Verification**
1. Visit login page
2. Complete Turnstile (if shown)
3. Enter credentials
4. Click "Sign In"
5. ✅ Should login successfully

**Test Case 2: Missing Verification**
1. Visit login page
2. Don't complete Turnstile
3. Enter credentials
4. Click "Sign In"
5. ❌ Should see: "Please complete the security verification"

**Test Case 3: Token Expiry**
1. Visit login page
2. Complete Turnstile
3. Wait 5+ minutes
4. Try to login
5. ❌ Should see: "Security verification expired"

---

## Troubleshooting

### Widget Not Appearing?

**Check 1: Environment Variables**
```bash
# Verify keys are set
echo $VITE_CLOUDFLARE_TURNSTILE_SITE_KEY
echo $VITE_CLOUDFLARE_TURNSTILE_ENABLED

# Restart dev server
npm run dev
```

**Check 2: Hostname Configuration**
- Ensure `localhost` is added to allowed hostnames in Cloudflare
- Or use wildcard: `*` (for testing only)

**Check 3: Browser Console**
```javascript
// Open DevTools → Console
// Look for errors related to Turnstile
// Should see Turnstile script loaded
```

### "Invalid Site Key" Error?

**Solution**:
1. Verify Site Key is correct in `.env`
2. Check for extra spaces or quotes
3. Ensure Site Key starts with `0x4...`

### Widget Shows but Login Fails?

**Solution**:
1. Check browser console for errors
2. Verify token is being captured
3. Try refreshing the page

---

## Production Deployment

### Before Going Live:

1. **Update Hostnames**:
   ```
   Remove: localhost
   Add: yourdomain.com, www.yourdomain.com
   ```

2. **Verify Environment**:
   ```env
   # Production .env
   VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your-production-key
   VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY=your-production-secret
   VITE_CLOUDFLARE_TURNSTILE_ENABLED=true
   ```

3. **Test Thoroughly**:
   - Test from different locations
   - Test on mobile devices
   - Test with different browsers

4. **Monitor Dashboard**:
   - Check Cloudflare Turnstile analytics
   - Monitor verification success rate
   - Watch for abuse patterns

---

## Advanced Configuration (Optional)

### Multiple Domains

If you have multiple domains:
```
Hostnames:
- yourdomain.com
- subdomain.yourdomain.com
- anotherdomain.com
```

### Wildcard Domains

For all subdomains:
```
Hostnames:
- *.yourdomain.com
```

### Regional Settings

For specific regions, create separate widgets:
- Widget 1: US domains
- Widget 2: EU domains
- Widget 3: Asia domains

---

## Quick Reference Card

```
┌───────────────────────────────────────────────┐
│        CLOUDFLARE TURNSTILE SETUP             │
├───────────────────────────────────────────────┤
│                                               │
│  🌐 Dashboard:                                │
│     dash.cloudflare.com → Turnstile          │
│                                               │
│  ➕ Create Widget:                            │
│     Click "Add Site"                          │
│                                               │
│  🏠 Hostname:                                 │
│     Production: yourdomain.com                │
│     Development: localhost                    │
│                                               │
│  🎛️ Mode:                                     │
│     ✅ Managed (Recommended)                  │
│     ○ Non-Interactive                         │
│     ○ Invisible                               │
│                                               │
│  🔐 Pre-clearance:                            │
│     ☐ Disabled (Recommended)                  │
│                                               │
│  🔑 Copy Keys:                                │
│     • Site Key (Public)                       │
│     • Secret Key (Private)                    │
│                                               │
│  ⚙️ Configure:                                │
│     Add to .env file                          │
│     Restart server                            │
│                                               │
│  ✅ Test:                                     │
│     Visit /sign-in                            │
│     Complete verification                     │
│     Login                                     │
│                                               │
└───────────────────────────────────────────────┘
```

---

## Next Steps

After creating your widget:

1. ✅ **Configure `.env`** - Add your keys
2. ✅ **Test locally** - Verify it works on localhost
3. ✅ **Deploy** - Push to production
4. ✅ **Monitor** - Check Cloudflare analytics

Need help? Check the main documentation: `CLOUDFLARE_TURNSTILE_SETUP.md`

---

## Support & Resources

- **Cloudflare Turnstile Docs**: https://developers.cloudflare.com/turnstile/
- **Dashboard**: https://dash.cloudflare.com/
- **Community**: https://community.cloudflare.com/
- **Status**: https://www.cloudflarestatus.com/

---

**Your Turnstile widget is ready to protect your login page! 🛡️**

