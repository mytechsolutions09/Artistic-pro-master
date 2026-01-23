# Email Verification Setup Guide

## Problem
New users are getting verified automatically without email verification, which is a security issue.

## Solution
This guide will help you properly configure email verification in your Supabase project.

## 1. Supabase Dashboard Configuration

### Step 1: Authentication Settings
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Settings**
3. Under **User Signups**, ensure:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Enable email change confirmations** is checked
   - ❌ **Enable phone confirmations** is unchecked (unless needed)

### Step 2: Email Templates
1. Go to **Authentication** > **Email Templates**
2. Configure the **Confirm signup** template:
   - **Subject**: "Confirm your email address"
   - **Body**: Use the default template or customize as needed
   - **Redirect URL**: Set to your app's sign-in page (e.g., `https://yourdomain.com/sign-in`)

### Step 3: SMTP Settings (Optional but Recommended)
1. Go to **Authentication** > **Settings** > **SMTP Settings**
2. Configure your custom SMTP provider for better deliverability:
   - **Host**: Your SMTP server
   - **Port**: Usually 587 or 465
   - **Username**: Your SMTP username
   - **Password**: Your SMTP password
   - **Sender name**: Your app name
   - **Sender email**: Your verified sender email

## 2. Code Changes Made

### SignUpForm.tsx
```typescript
const { data, error } = await supabase.auth.signUp({
  email: email.trim(),
  password: password.trim(),
  options: {
    emailRedirectTo: `${window.location.origin}/sign-in`,
    data: {
      email_confirm: true
    }
  }
});
```

### AuthContext.tsx
```typescript
const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/sign-in`,
      data: {
        email_confirm: true
      }
    }
  });
  return { error };
};
```

## 3. SQL Configuration

Run the `enable_email_verification.sql` script in your Supabase SQL Editor to:
- Set up proper RLS policies that respect email confirmation status
- Create helper functions for email verification checks
- Add cleanup for unconfirmed users
- Create views for confirmed users only

**Note**: Email confirmation settings are configured in the Supabase Dashboard, not via SQL.

## 4. Testing the Flow

### Test Case 1: New User Signup
1. Go to `/sign-up`
2. Enter a valid email and password
3. Click "Create Account"
4. **Expected Result**: 
   - Success message appears
   - User is NOT automatically signed in
   - Email verification link is sent to the email

### Test Case 2: Email Verification
1. Check the email inbox
2. Click the verification link
3. **Expected Result**:
   - Redirected to sign-in page
   - User can now sign in with their credentials

### Test Case 3: Unverified User Login
1. Try to sign in with unverified credentials
2. **Expected Result**:
   - Login should fail or show "Please verify your email" message

## 5. Security Benefits

- **Prevents fake accounts**: Users must have access to the email address
- **Reduces spam**: Automated signups are harder without email access
- **Better user data quality**: Verified emails are more likely to be valid
- **Compliance**: Meets many regulatory requirements for user verification

## 6. Troubleshooting

### Issue: Users still getting auto-verified
**Solution**: 
1. Check Supabase Dashboard > Authentication > Settings
2. Ensure "Enable email confirmations" is checked
3. Run the SQL script to update configuration

### Issue: Email not being sent
**Solution**:
1. Check SMTP settings in Supabase Dashboard
2. Verify sender email is properly configured
3. Check spam folder
4. Test with a different email provider

### Issue: Verification link not working
**Solution**:
1. Check the redirect URL in email templates
2. Ensure your domain is properly configured
3. Verify the link format in the email

## 7. Additional Security Measures

### Rate Limiting
Consider implementing rate limiting for signup attempts to prevent abuse.

### Email Validation
Add client-side email validation to ensure proper email format.

### Cleanup Unconfirmed Users
The SQL script includes a cleanup function to remove unconfirmed users after 24 hours.

## 8. Monitoring

Monitor your authentication logs in Supabase Dashboard to:
- Track signup attempts
- Monitor email delivery rates
- Identify potential abuse patterns

## 9. User Experience

### Clear Messaging
- Inform users they need to check their email
- Provide clear instructions on what to do next
- Show helpful error messages for unverified users

### Resend Verification
Consider adding a "Resend verification email" feature for users who didn't receive the email.

## 10. Production Checklist

Before going live:
- [ ] Email confirmations enabled in Supabase
- [ ] SMTP properly configured
- [ ] Email templates customized
- [ ] SQL script executed
- [ ] Test with real email addresses
- [ ] Monitor email delivery rates
- [ ] Set up proper error handling
- [ ] Configure rate limiting if needed

This setup ensures that all new users must verify their email address before they can access your application, providing better security and user data quality.
