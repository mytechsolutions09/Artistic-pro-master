# Cloudflare Turnstile Error 110200 - Fix Guide

## ❌ Error Message

```
[Cloudflare Turnstile] Error: 110200
Turnstile verification error
```

## 🔍 What This Error Means

**Error Code 110200**: Domain not authorized for this Turnstile widget.

This error occurs when:
- Your website domain is NOT listed in the Cloudflare Turnstile widget configuration
- You're testing on a domain that wasn't added during widget setup
- The domain name doesn't match what's configured in Cloudflare

## ✅ Quick Fix (2 minutes)

### Step 1: Check Your Current Domain

Open browser console (F12) and check what domain you're on:

```javascript
console.log(window.location.hostname);
// Example outputs:
// - "localhost" (local development)
// - "yourdomain.com" (production)
// - "www.yourdomain.com" (production with www)
```

### Step 2: Add Domain to Cloudflare

1. **Go to Cloudflare Dashboard**:
   ```
   https://dash.cloudflare.com/
   ```

2. **Navigate to Turnstile**:
   - Click "Turnstile" in the left sidebar
   - Find your widget in the list
   - Click on the widget name to edit

3. **Add Missing Domain**:
   ```
   ┌─────────────────────────────────────────┐
   │  Hostname Management                    │
   ├─────────────────────────────────────────┤
   │  ┌───────────────────────────────────┐ │
   │  │ localhost                         │ │  ← Add this for local dev
   │  │ yourdomain.com                    │ │  ← Add your domain
   │  │ www.yourdomain.com                │ │  ← Add www version
   │  └───────────────────────────────────┘ │
   └─────────────────────────────────────────┘
   ```

4. **Save Changes**:
   - Click "Save" or "Update"

### Step 3: Clear Cache & Refresh

```bash
# Clear browser cache
# Or use Incognito/Private window

# Refresh the page
Press: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
```

## 🎯 Common Scenarios

### Scenario 1: Testing Locally

**Problem**: Getting error on `localhost`

**Solution**:
```
Add to Cloudflare Turnstile:
- localhost
- 127.0.0.1
```

### Scenario 2: Production Domain

**Problem**: Getting error on `yourdomain.com`

**Solution**:
```
Add to Cloudflare Turnstile:
- yourdomain.com
- www.yourdomain.com (if you use www)
```

### Scenario 3: Subdomain

**Problem**: Getting error on `app.yourdomain.com`

**Solution**:
```
Add to Cloudflare Turnstile:
- app.yourdomain.com

OR use wildcard:
- *.yourdomain.com (covers all subdomains)
```

### Scenario 4: Multiple Environments

**Problem**: Need to test on multiple domains

**Solution**:
```
Add all domains to Cloudflare Turnstile:
- localhost (development)
- staging.yourdomain.com (staging)
- yourdomain.com (production)
- www.yourdomain.com (production www)
```

## 📋 Detailed Fix Instructions

### For Cloudflare Dashboard

1. **Login to Cloudflare**:
   - Visit: https://dash.cloudflare.com/
   - Enter your credentials

2. **Access Turnstile Settings**:
   ```
   Dashboard → Turnstile → [Your Widget Name] → Edit
   ```

3. **Locate Hostname Management Section**:
   ```
   Look for:
   "Hostname Management"
   "You have configured X out of 10 available hostnames"
   ```

4. **Add Your Domain**:
   - Click in the input field
   - Type your domain name
   - Press Enter or Tab to add
   - Example: `localhost` (for development)
   - Example: `yourdomain.com` (for production)

5. **Add Multiple Domains (Optional)**:
   - You can add up to 10 hostnames
   - Separate with commas or press Enter after each
   - Examples:
     ```
     localhost, 127.0.0.1, yourdomain.com, www.yourdomain.com
     ```

6. **Use Wildcards (Advanced)**:
   - For all subdomains: `*.yourdomain.com`
   - For any domain (NOT RECOMMENDED): Leave empty or use `*`

7. **Save Configuration**:
   - Scroll to bottom
   - Click "Save" or "Update Widget"

### Visual Guide

```
┌────────────────────────────────────────────────────┐
│  Edit Turnstile Widget                             │
├────────────────────────────────────────────────────┤
│                                                    │
│  Widget Name: My Login Widget                     │
│  Site Key: 0x4AAAA...                             │
│                                                    │
│  📍 Hostname Management                            │
│  ┌──────────────────────────────────────────────┐ │
│  │ localhost                                    │ │  ← Add this
│  │ yourdomain.com                               │ │  ← And this
│  └──────────────────────────────────────────────┘ │
│  💡 You have configured 2 out of 10              │
│                                                    │
│  Widget Mode: ● Managed                           │
│  Pre-clearance: ☐ Disabled                        │
│                                                    │
│  [ Save ]                                         │
└────────────────────────────────────────────────────┘
```

## 🔧 Verification Steps

After adding the domain:

### 1. Check Configuration
```
✓ Domain added to Cloudflare Turnstile
✓ Changes saved
✓ Configuration confirmed
```

### 2. Clear Browser Data
```
Options → Privacy → Clear browsing data
Select: Cached images and files
Time range: Last hour
Click: Clear data
```

### 3. Test Again
```bash
# Refresh your login page
# The Turnstile widget should now load without error
```

### 4. Verify in Console
```javascript
// Open browser console (F12)
// Look for:
"Turnstile verification successful" ✅

// Should NOT see:
"Error: 110200" ❌
```

## 🚨 Still Getting Error?

### Double-Check These:

#### 1. Exact Domain Match
```
❌ Wrong: yourdomain.com (configured)
          www.yourdomain.com (visiting)

✅ Correct: Both added to Cloudflare
```

#### 2. HTTPS vs HTTP
```
Domain in browser: https://yourdomain.com
Domain in Cloudflare: yourdomain.com (protocol doesn't matter)

✅ This is correct - no need for https:// in Cloudflare
```

#### 3. Port Numbers
```
❌ localhost:3000 is different from localhost
✅ Use just: localhost (without port)
   Or wildcard: *.localhost
```

#### 4. Subdomains
```
app.yourdomain.com ≠ yourdomain.com

✅ Add both OR use wildcard: *.yourdomain.com
```

## 💡 Best Practice Recommendations

### For Development
```
Add these to Cloudflare Turnstile:
- localhost
- 127.0.0.1
- *.localhost (if using subdomains locally)
```

### For Production
```
Add these to Cloudflare Turnstile:
- yourdomain.com
- www.yourdomain.com
- Any subdomains (e.g., app.yourdomain.com)
```

### For Testing
```
Create separate widgets for:
- Development (localhost, test domains)
- Production (live domains)

Or use one widget with all domains listed
```

## 📊 Error Resolution Checklist

- [ ] Identified current domain (check browser console)
- [ ] Logged into Cloudflare Dashboard
- [ ] Navigated to Turnstile section
- [ ] Found and edited widget
- [ ] Added missing domain to hostname list
- [ ] Saved configuration
- [ ] Cleared browser cache
- [ ] Refreshed page (Ctrl+F5)
- [ ] Verified error is gone
- [ ] Tested login functionality

## 🎯 Alternative Solutions

### Solution 1: Use Wildcard (For Testing Only)

If you're still testing and don't want to keep adding domains:

```
In Cloudflare Turnstile:
Hostname: * (asterisk)

⚠️ WARNING: This allows ANY domain
⚠️ Only use for testing
⚠️ Change to specific domains before production
```

### Solution 2: Create Multiple Widgets

For better organization:

```
Widget 1: Development
- Hostnames: localhost, 127.0.0.1
- Use these keys in .env.development

Widget 2: Production
- Hostnames: yourdomain.com, www.yourdomain.com
- Use these keys in .env.production
```

## 📞 Need More Help?

### Additional Debugging

Add this to your `.env` for more detailed logging:

```env
# Enable debug mode
NODE_ENV=development
```

Check browser console for detailed error information.

### Still Stuck?

1. **Verify Site Key**:
   ```bash
   echo $VITE_CLOUDFLARE_TURNSTILE_SITE_KEY
   # Should start with: 0x4AAAA...
   ```

2. **Check Widget Status**:
   - Go to Cloudflare Dashboard
   - Turnstile section
   - Verify widget is "Active"

3. **Test with Different Browser**:
   - Try Incognito/Private mode
   - Try different browser entirely

4. **Check Cloudflare Status**:
   - Visit: https://www.cloudflarestatus.com/
   - Verify Turnstile service is operational

## 🔗 Resources

- **Cloudflare Turnstile Docs**: https://developers.cloudflare.com/turnstile/
- **Error Codes Reference**: https://developers.cloudflare.com/turnstile/troubleshooting/
- **Dashboard**: https://dash.cloudflare.com/
- **Support**: https://community.cloudflare.com/

---

## ✅ Summary

**Error 110200** = Domain not authorized

**Quick Fix**:
1. Go to Cloudflare Dashboard
2. Edit your Turnstile widget
3. Add your domain to hostname list
4. Save and refresh

**Most Common Fix**:
- Add `localhost` for local development
- Add `yourdomain.com` for production

---

**After fixing, your Turnstile should work perfectly! 🎉**

