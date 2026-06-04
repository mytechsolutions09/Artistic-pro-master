# Cloudflare Turnstile Integration

## Overview
Cloudflare Turnstile is a user-friendly CAPTCHA alternative that protects your login page from bots while providing a seamless user experience.

## Features
- **Bot Protection**: Prevents automated bot attacks on login
- **Privacy-Friendly**: No personal data collection
- **User-Friendly**: Invisible or minimal interaction required
- **Fast**: Optimized for performance
- **Free Tier**: Generous free usage limits

## Setup Guide

### 1. Get Cloudflare Turnstile Keys

1. **Create Cloudflare Account**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Sign up or log in to your account

2. **Navigate to Turnstile**:
   - In the dashboard, go to **Turnstile** section
   - Or visit directly: https://dash.cloudflare.com/?to=/:account/turnstile

3. **Create a New Site**:
   - Click **Add Site**
   - Enter your domain name (e.g., `yourdomain.com`)
   - Select widget mode:
     - **Managed**: Automatically adjusts based on risk
     - **Non-Interactive**: Invisible, runs in background
     - **Invisible**: No visible challenge unless necessary
   - Click **Create**

4. **Copy Your Keys**:
   - **Site Key**: Public key for frontend
   - **Secret Key**: Private key for backend verification

### 2. Configure Environment Variables

1. **Copy the template**:
   ```bash
   cp env.template .env
   ```

2. **Add your Cloudflare Turnstile keys** to `.env`:
   ```env
   # Cloudflare Turnstile Configuration
   VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your-site-key-here
   VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY=your-secret-key-here
   VITE_CLOUDFLARE_TURNSTILE_THEME=light
   VITE_CLOUDFLARE_TURNSTILE_ENABLED=true
   ```

3. **Configuration Options**:
   - `SITE_KEY`: Your Cloudflare Turnstile site key (required)
   - `SECRET_KEY`: Your Cloudflare Turnstile secret key (for backend verification)
   - `THEME`: Widget appearance - `light`, `dark`, or `auto` (default: `light`)
   - `ENABLED`: Enable/disable Turnstile - `true` or `false` (default: `true`)

### 3. Files Created

#### **Component**: `src/components/auth/CloudflareTurnstile.tsx`
React component that renders the Turnstile widget.

**Features**:
- Automatic script loading
- Event callbacks (verify, error, expire)
- Theme customization
- Size options (normal, compact)
- Cleanup on unmount

#### **Integration**: `src/components/auth/LoginForm.tsx`
Login form with Turnstile verification.

**Features**:
- Conditional rendering (only if enabled)
- Token validation before login
- Error handling
- User feedback

#### **Environment**: `env.template`
Updated with Turnstile configuration variables.

## Usage

### Basic Implementation

The Turnstile component is already integrated into the login page. It will automatically:

1. **Load** when the login page is accessed
2. **Verify** the user is human
3. **Generate** a verification token
4. **Validate** the token before allowing login

### Enable/Disable Turnstile

To enable Turnstile:
```env
VITE_CLOUDFLARE_TURNSTILE_ENABLED=true
```

To disable Turnstile:
```env
VITE_CLOUDFLARE_TURNSTILE_ENABLED=false
```

**Note**: If disabled or no site key is provided, the login will work normally without CAPTCHA.

### Customization

#### Theme
```env
VITE_CLOUDFLARE_TURNSTILE_THEME=light  # or dark, auto
```

#### Widget Size
In `CloudflareTurnstile` component:
```typescript
<CloudflareTurnstile
  size="normal"  // or "compact"
  theme="light"  // or "dark", "auto"
/>
```

## Component API

### CloudflareTurnstile Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onVerify` | `(token: string) => void` | Yes | - | Callback when verification succeeds |
| `onError` | `() => void` | No | - | Callback when verification fails |
| `onExpire` | `() => void` | No | - | Callback when token expires |
| `theme` | `'light' \| 'dark' \| 'auto'` | No | `'light'` | Widget theme |
| `size` | `'normal' \| 'compact'` | No | `'normal'` | Widget size |

### Example Usage

```typescript
import CloudflareTurnstile from './CloudflareTurnstile';

function MyLoginForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <form>
      {/* Your form fields */}
      
      <CloudflareTurnstile
        onVerify={(token) => {
          setTurnstileToken(token);
          console.log('Verification successful!');
        }}
        onError={() => {
          setTurnstileToken(null);
          console.error('Verification failed');
        }}
        onExpire={() => {
          setTurnstileToken(null);
          console.warn('Token expired');
        }}
        theme="light"
        size="normal"
      />
      
      <button type="submit">Login</button>
    </form>
  );
}
```

## How It Works

### User Flow

1. **User visits login page**
   - Turnstile widget loads automatically
   - User may see a challenge or it may be invisible

2. **User completes verification**
   - Turnstile generates a verification token
   - Token is stored in component state

3. **User submits login form**
   - System checks if token exists
   - If valid, login proceeds
   - If missing, user sees error message

4. **Token lifecycle**
   - Tokens expire after a few minutes
   - User must re-verify if token expires

### Backend Verification (Optional)

For enhanced security, verify the token on the backend:

```javascript
// Example: Verify token with Cloudflare API
const verifyTurnstileToken = async (token) => {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );
  
  const data = await response.json();
  return data.success;
};
```

## Testing

### Test with Different Scenarios

1. **Valid Verification**:
   - Complete the CAPTCHA
   - Submit login form
   - Should proceed to login

2. **Missing Verification**:
   - Refresh page
   - Don't complete CAPTCHA
   - Try to login
   - Should see error: "Please complete the security verification"

3. **Expired Token**:
   - Complete CAPTCHA
   - Wait a few minutes
   - Try to login
   - Should see error about expired verification

### Cloudflare Dashboard

Monitor Turnstile performance:
- Visit Turnstile section in Cloudflare Dashboard
- View analytics (requests, challenges, etc.)
- Check for abuse patterns

## Troubleshooting

### Widget Not Appearing

**Check**:
1. Is `VITE_CLOUDFLARE_TURNSTILE_ENABLED=true`?
2. Is `VITE_CLOUDFLARE_TURNSTILE_SITE_KEY` set?
3. Are environment variables loaded? (Restart dev server)
4. Check browser console for errors

### "Please complete the security verification" Error

**Causes**:
- Turnstile not completed
- Token expired
- Token cleared/reset

**Solution**:
- Complete the CAPTCHA challenge
- Refresh page if token expired

### Script Loading Errors

**Check**:
1. Internet connection
2. Cloudflare API accessibility
3. Browser console for network errors
4. Ad blockers or privacy extensions

## Security Best Practices

1. **Keep Secret Key Secure**:
   - Never expose secret key in frontend
   - Store in `.env` file
   - Add `.env` to `.gitignore`

2. **Verify on Backend**:
   - For sensitive operations, verify token on backend
   - Don't trust client-side verification alone

3. **Rate Limiting**:
   - Combine with rate limiting for extra protection
   - Limit login attempts per IP/user

4. **Monitor Analytics**:
   - Regularly check Cloudflare Turnstile dashboard
   - Look for suspicious patterns

## Benefits

### For Users
- ✅ Fast and seamless experience
- ✅ No annoying image puzzles
- ✅ Privacy-friendly (no tracking)
- ✅ Mobile-friendly

### For Developers
- ✅ Easy integration
- ✅ Free tier available
- ✅ Comprehensive analytics
- ✅ Low maintenance

### For Business
- ✅ Prevents bot attacks
- ✅ Protects user accounts
- ✅ Reduces fraud
- ✅ Improves security posture

## Additional Resources

- **Cloudflare Turnstile Docs**: https://developers.cloudflare.com/turnstile/
- **Dashboard**: https://dash.cloudflare.com/
- **API Reference**: https://developers.cloudflare.com/turnstile/get-started/
- **Best Practices**: https://developers.cloudflare.com/turnstile/best-practices/

## Support

For issues or questions:
1. Check Cloudflare Turnstile documentation
2. Review browser console for errors
3. Verify environment variables are correct
4. Test with different browsers
5. Check Cloudflare status page

## Changelog

### v1.0.0 - Initial Implementation
- Added Cloudflare Turnstile component
- Integrated with login page
- Added environment configuration
- Created documentation

---

**Note**: Cloudflare Turnstile is currently integrated only on the login page. To add it to signup or other forms, follow the same pattern used in `LoginForm.tsx`.

