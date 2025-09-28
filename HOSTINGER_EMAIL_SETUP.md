# Hostinger Email Setup Guide

## Overview
This guide will help you configure your Artistic Pro application to use Hostinger's SMTP service for sending emails.

## Prerequisites
- Hostinger hosting account with email service
- Domain configured with Hostinger
- Email account created in Hostinger control panel

## Step 1: Create Email Account in Hostinger

1. Log in to your Hostinger control panel
2. Navigate to **Email** section
3. Click **Create Email Account**
4. Create an email account (e.g., `noreply@yourdomain.com`)
5. Note down the email address and password

## Step 2: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Hostinger SMTP Configuration
VITE_SMTP_HOST=smtp.hostinger.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=your-email@yourdomain.com
VITE_SMTP_PASS=your-email-password

# Email Settings
VITE_EMAIL_FROM_NAME=Artistic Pro
VITE_EMAIL_FROM_EMAIL=your-email@yourdomain.com
VITE_EMAIL_REPLY_NAME=Artistic Pro Support
VITE_EMAIL_REPLY_EMAIL=support@yourdomain.com
```

## Step 3: Hostinger SMTP Settings

### SMTP Configuration Details:
- **Host**: `smtp.hostinger.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **Security**: TLS (recommended) or SSL
- **Authentication**: Required
- **Username**: Your full email address
- **Password**: Your email account password

### Alternative Ports:
- Port `587` with TLS (recommended)
- Port `465` with SSL
- Port `25` (not recommended for production)

## Step 4: Test Email Configuration

1. Start your development server
2. Navigate to Admin > Email Management
3. Try sending a test email
4. Check the console for any SMTP connection errors

## Step 5: Production Deployment

### For Netlify:
1. Add environment variables in Netlify dashboard
2. Go to Site settings > Environment variables
3. Add all the SMTP variables from your `.env` file

### For Vercel:
1. Add environment variables in Vercel dashboard
2. Go to Project settings > Environment variables
3. Add all the SMTP variables from your `.env` file

## Email Types Supported

The system now supports the following email types:

1. **Order Confirmation Emails**
   - Sent automatically when orders are completed
   - Includes order details and download links
   - Professional HTML template

2. **Welcome Emails**
   - Sent to new users after signup
   - Includes onboarding information
   - Branded template

3. **Password Reset Emails**
   - Sent when users request password reset
   - Secure reset links with expiration
   - Security-focused template

4. **Admin Marketing Emails**
   - Sent through the admin email management interface
   - Support for bulk sending
   - Template system

## Rate Limiting

The email system includes built-in rate limiting:
- **Hourly Limit**: 100 emails per hour
- **Daily Limit**: 1000 emails per day

These limits can be adjusted in `src/config/email.ts`.

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Verify email credentials
   - Check if 2FA is enabled (disable for SMTP)
   - Ensure email account is active

2. **Connection Timeout**
   - Check firewall settings
   - Verify SMTP host and port
   - Try different ports (587, 465, 25)

3. **Emails Not Delivered**
   - Check spam folder
   - Verify sender email is not blacklisted
   - Ensure proper SPF/DKIM records

### Testing SMTP Connection:

You can test your SMTP connection using online tools or by checking the browser console for connection logs.

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for email accounts
3. **Enable SPF and DKIM** records in DNS
4. **Monitor email sending** for abuse
5. **Implement proper rate limiting**

## Email Templates

The system includes professional HTML email templates for:
- Order confirmations
- Welcome messages
- Password resets
- Marketing campaigns

Templates can be customized in `src/services/emailService.ts`.

## Monitoring

The admin dashboard includes email statistics:
- Emails sent today
- Emails sent this hour
- Rate limit remaining
- Delivery status

## Support

If you encounter issues:
1. Check Hostinger's email documentation
2. Verify SMTP settings in Hostinger control panel
3. Test with a simple email client first
4. Check application logs for detailed error messages

## Next Steps

After setup:
1. Test all email functionality
2. Customize email templates
3. Set up email monitoring
4. Configure backup email service (optional)
5. Implement email analytics (optional)
