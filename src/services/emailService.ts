'use client'

import { emailConfig, EmailType, EmailPriority, isValidEmail } from '../config/email';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from './supabaseService';

// Email interfaces
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  cid?: string; // Content-ID for inline images
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  priority?: EmailPriority;
  replyTo?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  headers?: Record<string, string>;
  smtpConfig?: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    fromName?: string;
    fromEmail?: string;
  };
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Email templates
export const emailTemplates: Record<string, EmailTemplate> = {
  [EmailType.ORDER_CONFIRMATION]: {
    subject: 'Order Confirmed – #{{orderId}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; -webkit-font-smoothing: antialiased; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }

    /* Header */
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #f0fdf4; color: #15803d; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #bbf7d0; letter-spacing: 0.03em; }

    /* Hero */
    .hero { padding: 32px 40px 24px; border-bottom: 1px solid #f3f4f6; }
    .hero h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .hero p { font-size: 15px; color: #6b7280; line-height: 1.6; }

    /* Order meta */
    .meta-grid { display: table; width: 100%; margin: 24px 0 0; border-collapse: collapse; }
    .meta-cell { display: table-cell; width: 33.3%; padding: 14px 0; text-align: center; }
    .meta-cell + .meta-cell { border-left: 1px solid #f3f4f6; }
    .meta-label { font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #0f172a; }

    /* Section */
    .section { padding: 28px 40px; border-top: 1px solid #f3f4f6; }
    .section-title { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }

    /* Item row */
    .item-row { display: table; width: 100%; padding: 14px 0; border-bottom: 1px solid #f9fafb; }
    .item-row:last-child { border-bottom: none; }
    .item-left { display: table-cell; vertical-align: middle; }
    .item-right { display: table-cell; vertical-align: middle; text-align: right; width: 100px; }
    .item-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 3px; }
    .item-meta { font-size: 12px; color: #9ca3af; }
    .item-price { font-size: 15px; font-weight: 700; color: #0f172a; }

    /* Totals */
    .totals { padding-top: 16px; border-top: 1px solid #f3f4f6; margin-top: 8px; }
    .totals-row { display: table; width: 100%; padding: 6px 0; }
    .totals-label { display: table-cell; font-size: 13px; color: #6b7280; }
    .totals-value { display: table-cell; text-align: right; font-size: 13px; color: #374151; font-weight: 500; }
    .totals-row.grand .totals-label { font-size: 15px; font-weight: 700; color: #0f172a; }
    .totals-row.grand .totals-value { font-size: 16px; font-weight: 700; color: #0f172a; }
    .totals-row.gst .totals-label,
    .totals-row.gst .totals-value { color: #9ca3af; font-size: 12px; }

    /* Download */
    .download-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin-top: 4px; }
    .download-block p { font-size: 13px; color: #6b7280; margin-bottom: 14px; }
    .download-btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 13px; font-weight: 600; padding: 10px 20px; text-decoration: none; border-radius: 8px; margin: 4px 4px 4px 0; letter-spacing: 0.02em; }

    /* Help */
    .help-block { background: #fafafa; border-radius: 10px; padding: 20px 24px; }
    .help-block p { font-size: 13px; color: #6b7280; line-height: 1.6; }
    .help-block a { color: #4f46e5; text-decoration: none; font-weight: 500; }

    /* Footer */
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">

    <!-- Header / Logo -->
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">✓ Order Confirmed</div>
    </div>

    <!-- Hero -->
    <div class="hero">
      <h1>Thank you, \${'{customerName}'}!</h1>
      <p>Your order has been placed successfully. We'll send you another email once your item ships or your digital download is ready.</p>

      <!-- Order Meta -->
      <div class="meta-grid">
        <div class="meta-cell">
          <div class="meta-label">Order Number</div>
          <div class="meta-value">#\${'{orderId}'}</div>
        </div>
        <div class="meta-cell">
          <div class="meta-label">Date</div>
          <div class="meta-value">\${'{orderDate}'}</div>
        </div>
        <div class="meta-cell">
          <div class="meta-label">Total Paid</div>
          <div class="meta-value">₹\${'{totalAmount}'}</div>
        </div>
      </div>
    </div>

    <!-- Items -->
    <div class="section">
      <div class="section-title">Your Items</div>
      \${'{items}'}

      <!-- Totals -->
      <div class="totals">
        <div class="totals-row grand">
          <div class="totals-label">Total</div>
          <div class="totals-value">₹\${'{totalAmount}'}</div>
        </div>
        <div class="totals-row gst">
          <div class="totals-label">Includes GST of ₹\${'{gstAmount}'}</div>
          <div class="totals-value"></div>
        </div>
      </div>
    </div>

    <!-- Downloads (only shown if digital items exist) -->
    \${'{downloadSection}'}

    <!-- Help -->
    <div class="section">
      <div class="section-title">Need Help?</div>
      <div class="help-block">
        <p>Have a question about your order? Our team is happy to help.<br>
        Reach us at <a href="mailto:support@lurevi.in">support@lurevi.in</a> and we'll get back to you promptly.</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        © 2026 Lurevi. All rights reserved.<br>
        <a href="https://lurevi.in">lurevi.in</a>
      </p>
    </div>

  </div>
</div>
</body>
</html>`,
    text: `Order Confirmed – #\${'{orderId}'}

Thank you for your purchase, \${'{customerName}'}!

Order Details:
- Order Number: #\${'{orderId}'}
- Order Date: \${'{orderDate}'}
- Total Amount: ₹\${'{totalAmount}'} (Includes ₹\${'{gstAmount}'} GST)

Your Items:
\${'{itemsText}'}

Download Your Artwork:
\${'{downloadLinksText}'}

Need Help?
Contact us at support@lurevi.in

© 2026 Lurevi. All rights reserved. | lurevi.in`
  },
  
  [EmailType.WELCOME]: {
    subject: 'Welcome to Lurevi!',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #eef2ff; color: #4338ca; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #c7d2fe; }
    .section { padding: 28px 40px; border-top: 1px solid #f3f4f6; }
    .section h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
    .section p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 12px; }
    .feature-list { list-style: none; padding: 0; margin: 16px 0; }
    .feature-list li { font-size: 14px; color: #374151; padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 10px; }
    .feature-list li::before { content: '→'; color: #6366f1; font-weight: 700; }
    .cta-wrap { text-align: center; padding: 8px 0 4px; }
    .cta-btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 14px; font-weight: 600; padding: 13px 28px; text-decoration: none; border-radius: 8px; letter-spacing: 0.02em; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">✦ Welcome Aboard</div>
    </div>
    <div class="section">
      <h1>Hello, \${'{userName}'}!</h1>
      <p>Welcome to Lurevi — where art meets technology. We're thrilled to have you join our community of artists and art lovers.</p>
      <ul class="feature-list">
        <li>Browse our curated collection of artwork</li>
        <li>Purchase high-quality prints &amp; digital downloads</li>
        <li>Build your personal art collection</li>
        <li>Get early access to new releases</li>
      </ul>
      <div class="cta-wrap">
        <a href="\${'{dashboardUrl}'}" class="cta-btn">Explore Your Dashboard</a>
      </div>
    </div>
    <div class="section">
      <p>Questions? Reach us at <a href="mailto:support@lurevi.in" style="color:#4f46e5;text-decoration:none;font-weight:500;">support@lurevi.in</a> — we're happy to help.</p>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  },
  
  [EmailType.PASSWORD_RESET]: {
    subject: 'Reset Your Password – Lurevi',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #fef3c7; color: #92400e; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #fde68a; }
    .section { padding: 28px 40px; border-top: 1px solid #f3f4f6; }
    .section h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
    .section p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 12px; }
    .cta-wrap { text-align: center; padding: 8px 0 16px; }
    .cta-btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 14px; font-weight: 600; padding: 13px 28px; text-decoration: none; border-radius: 8px; }
    .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin: 16px 0; }
    .alert p { font-size: 13px; color: #78350f; margin: 0; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">🔒 Password Reset</div>
    </div>
    <div class="section">
      <h1>Hello, \${'{userName}'}!</h1>
      <p>We received a request to reset your Lurevi account password. Click the button below to set a new password.</p>
      <div class="cta-wrap">
        <a href="\${'{resetUrl}'}" class="cta-btn">Reset My Password</a>
      </div>
      <div class="alert">
        <p><strong>⏱ This link expires in 1 hour</strong> for security reasons. Do not share it with anyone.</p>
      </div>
      <p>If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  },
  [EmailType.RETURN_REQUEST]: {
    subject: 'New Return Request – Order #{{orderId}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Return Request – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #fffbeb; color: #92400e; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #fde68a; }
    .section { padding: 24px 40px; border-top: 1px solid #f3f4f6; }
    .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr td { padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .info-table tr:last-child td { border-bottom: none; }
    .info-table .lbl { color: #9ca3af; font-weight: 500; width: 40%; }
    .info-table .val { color: #111827; font-weight: 600; }
    .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; margin-bottom: 4px; }
    .alert p { font-size: 13px; color: #78350f; margin: 0; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; }
    .note-box p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
    .cta-wrap { text-align: center; padding: 8px 0; }
    .cta-btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 13px; font-weight: 600; padding: 11px 24px; text-decoration: none; border-radius: 8px; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">⚠ Action Required – New Return</div>
    </div>
    <div class="section">
      <div class="alert"><p>A customer has initiated a return request. Please review and process it promptly.</p></div>
    </div>
    <div class="section">
      <div class="section-title">Request Details</div>
      <table class="info-table">
        <tr><td class="lbl">Return ID</td><td class="val">\${'{returnId}'}</td></tr>
        <tr><td class="lbl">Order #</td><td class="val">\${'{orderId}'}</td></tr>
        <tr><td class="lbl">Customer</td><td class="val">\${'{customerName}'}</td></tr>
        <tr><td class="lbl">Email</td><td class="val">\${'{customerEmail}'}</td></tr>
        <tr><td class="lbl">Date</td><td class="val">\${'{requestDate}'}</td></tr>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Product</div>
      <table class="info-table">
        <tr><td class="lbl">Item</td><td class="val">\${'{productTitle}'}</td></tr>
        <tr><td class="lbl">Quantity</td><td class="val">\${'{quantity}'}</td></tr>
        <tr><td class="lbl">Amount</td><td class="val">₹\${'{totalPrice}'}</td></tr>
        <tr><td class="lbl">Reason</td><td class="val">\${'{reason}'}</td></tr>
      </table>
    </div>
    <div class="section">
      <div class="section-title">Customer Notes</div>
      <div class="note-box"><p>\${'{customerNotes}'}</p></div>
    </div>
    <div class="section">
      <div class="cta-wrap"><a href="\${'{adminUrl}'}" class="cta-btn">Review Return Request</a></div>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  },
  [EmailType.RETURN_APPROVED]: {
    subject: 'Return Approved – Order #{{orderId}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Approved – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #f0fdf4; color: #15803d; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #bbf7d0; }
    .section { padding: 24px 40px; border-top: 1px solid #f3f4f6; }
    .section h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .section p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 10px; }
    .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr td { padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .info-table tr:last-child td { border-bottom: none; }
    .info-table .lbl { color: #9ca3af; font-weight: 500; width: 40%; }
    .info-table .val { color: #111827; font-weight: 600; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-top: 4px; }
    .note-box p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">✓ Return Approved</div>
    </div>
    <div class="section">
      <h1>Great news, \${'{customerName}'}!</h1>
      <p>Your return request for order <strong style="color:#0f172a;">#\${'{orderId}'}</strong> has been approved by our team.</p>
    </div>
    <div class="section">
      <div class="section-title">Return Details</div>
      <table class="info-table">
        <tr><td class="lbl">Product</td><td class="val">\${'{productTitle}'}</td></tr>
        <tr><td class="lbl">Quantity</td><td class="val">\${'{quantity}'}</td></tr>
        <tr><td class="lbl">Value</td><td class="val">₹\${'{totalPrice}'}</td></tr>
      </table>
    </div>
    \${'{adminNotesSection}'}
    <div class="section">
      <div class="section-title">What Happens Next</div>
      <div class="note-box">
        <p>A return pickup has been scheduled. Please keep the item packed and ready with its original tags and invoice.<br><br>Once we receive and verify your item, we'll process your refund promptly.</p>
      </div>
    </div>
    <div class="section">
      <p>Questions? <a href="mailto:support@lurevi.in" style="color:#4f46e5;text-decoration:none;font-weight:500;">support@lurevi.in</a></p>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  },
  [EmailType.RETURN_REJECTED]: {
    subject: 'Return Update – Order #{{orderId}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Update – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #fef2f2; color: #991b1b; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #fecaca; }
    .section { padding: 24px 40px; border-top: 1px solid #f3f4f6; }
    .section h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .section p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 10px; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-top: 4px; }
    .note-box p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">Return Request Update</div>
    </div>
    <div class="section">
      <h1>Hello, \${'{customerName}'}!</h1>
      <p>We're writing to let you know that your return request for order <strong style="color:#0f172a;">#\${'{orderId}'}</strong> — <strong style="color:#0f172a;">\${'{productTitle}'}</strong> — could not be approved at this time.</p>
    </div>
    \${'{adminNotesSection}'}
    <div class="section">
      <div class="note-box">
        <p>If you believe this is an error or have further questions, please don't hesitate to contact our support team at <a href="mailto:support@lurevi.in" style="color:#4f46e5;text-decoration:none;font-weight:500;">support@lurevi.in</a>.</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  },
  [EmailType.REFUND_CONFIRMATION]: {
    subject: 'Refund Processed – Order #{{orderId}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #f0fdf4; color: #15803d; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #bbf7d0; }
    .section { padding: 24px 40px; border-top: 1px solid #f3f4f6; }
    .section h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .section p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 10px; }
    .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr td { padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .info-table tr:last-child td { border-bottom: none; }
    .info-table .lbl { color: #9ca3af; font-weight: 500; width: 40%; }
    .info-table .val { color: #111827; font-weight: 600; }
    .amount-highlight { font-size: 22px; font-weight: 700; color: #15803d; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; }
    .note-box p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">✓ Refund Processed</div>
    </div>
    <div class="section">
      <h1>Refund on its way, \${'{customerName}'}!</h1>
      <p>We've successfully processed a refund for order <strong style="color:#0f172a;">#\${'{orderId}'}</strong>.</p>
      <p class="amount-highlight">₹\${'{refundAmount}'}</p>
    </div>
    <div class="section">
      <div class="section-title">Refund Details</div>
      <table class="info-table">
        <tr><td class="lbl">Product</td><td class="val">\${'{productTitle}'}</td></tr>
        <tr><td class="lbl">Refund Method</td><td class="val">\${'{refundMethod}'}</td></tr>
      </table>
    </div>
    \${'{adminNotesSection}'}
    <div class="section">
      <div class="note-box">
        <p>Please allow 3–5 business days for the funds to reflect in your account, depending on your bank.</p>
      </div>
    </div>
    <div class="section">
      <p>Questions? <a href="mailto:support@lurevi.in" style="color:#4f46e5;text-decoration:none;font-weight:500;">support@lurevi.in</a></p>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  },
  [EmailType.RETURN_CONFIRMATION_CUSTOMER]: {
    subject: 'Return Request Received – Order #{{orderId}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Request Received – Lurevi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #ffffff; color: #111827; }
    .wrapper { background: #ffffff; padding: 40px 20px; }
    .email-card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; }
    .header { padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid #f3f4f6; }
    .logo-text { font-size: 28px; font-weight: 700; letter-spacing: 0.08em; color: #0f172a; text-transform: uppercase; }
    .logo-dot { color: #6366f1; }
    .badge { display: inline-block; margin-top: 20px; background: #fffbeb; color: #92400e; font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 100px; border: 1px solid #fde68a; }
    .section { padding: 24px 40px; border-top: 1px solid #f3f4f6; }
    .section h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .section p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 10px; }
    .section-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr td { padding: 9px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .info-table tr:last-child td { border-bottom: none; }
    .info-table .lbl { color: #9ca3af; font-weight: 500; width: 40%; }
    .info-table .val { color: #111827; font-weight: 600; }
    .note-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; }
    .note-box p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6; }
    .footer { padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="email-card">
    <div class="header">
      <div class="logo-text">Lurevi<span class="logo-dot">.</span></div>
      <div class="badge">↩ Return Request Received</div>
    </div>
    <div class="section">
      <h1>We got your request, \${'{customerName}'}!</h1>
      <p>We've received your return request for order <strong style="color:#0f172a;">#\${'{orderId}'}</strong>. Our team is reviewing it now.</p>
    </div>
    <div class="section">
      <div class="section-title">Return Summary</div>
      <table class="info-table">
        <tr><td class="lbl">Product</td><td class="val">\${'{productTitle}'}</td></tr>
        <tr><td class="lbl">Reason</td><td class="val">\${'{reason}'}</td></tr>
        <tr><td class="lbl">Quantity</td><td class="val">\${'{quantity}'}</td></tr>
      </table>
    </div>
    <div class="section">
      <div class="note-box">
        <p>We'll notify you by email once your request is updated — typically within 24–48 hours.</p>
      </div>
    </div>
    <div class="section">
      <p>Questions in the meantime? <a href="mailto:support@lurevi.in" style="color:#4f46e5;text-decoration:none;font-weight:500;">support@lurevi.in</a></p>
    </div>
    <div class="footer">
      <p>© 2026 Lurevi. All rights reserved.<br><a href="https://lurevi.in">lurevi.in</a></p>
    </div>
  </div>
</div>
</body>
</html>`
  }
};

/**
 * Email Service - Handles all email operations using Hostinger SMTP
 */
export class EmailService {
  private static emailQueue: EmailOptions[] = [];
  private static isProcessing = false;
  private static rateLimitTracker: { [key: string]: number } = {};

  /**
   * Send email using Hostinger SMTP
   */
  static async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Validate email addresses
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      for (const recipient of recipients) {
        if (!isValidEmail(recipient.email)) {
          return {
            success: false,
            error: `Invalid email address: ${recipient.email}`,
            recipient: recipient.email
          };
        }
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        };
      }

      const result = await this.sendViaSMTP(options);
      
      if (result.success) {

        this.updateRateLimit();
      }

      return result;

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send email using a template
   */
  static async sendTemplateEmail(
    templateType: EmailType,
    to: EmailRecipient | EmailRecipient[],
    templateData: Record<string, any>,
    customSubject?: string
  ): Promise<EmailResult> {
    const template = emailTemplates[templateType];
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${templateType}`
      };
    }

    // Replace template variables
    let subject = customSubject || template.subject;
    let html = template.html;
    let text = template.text;

    for (const [key, value] of Object.entries(templateData)) {
      const doubleBracePlaceholder = `{{${key}}}`;       // used in subjects
      const escapedPlaceholder = `\\$\\{'{${key}}'\\}`;  // used in HTML/text
      const stringValue = String(value || '');

      // Replace {{key}} in subject (and HTML/text just in case)
      subject = subject.split(doubleBracePlaceholder).join(stringValue);
      html = html.split(doubleBracePlaceholder).join(stringValue);

      // Replace \${'{key}'} in HTML/text bodies
      html = html.replace(new RegExp(escapedPlaceholder, 'g'), stringValue);
      if (text) {
        text = text.split(doubleBracePlaceholder).join(stringValue);
        text = text.replace(new RegExp(escapedPlaceholder, 'g'), stringValue);
      }
    }

    // Clean up any remaining placeholders that weren't replaced
    const remainingPlaceholders = html.match(/\\\$\\\{'\{[^}]+\}'\\\}/g);
    if (remainingPlaceholders) {
      console.warn('⚠️ Remaining placeholders found:', remainingPlaceholders);
      remainingPlaceholders.forEach(ph => {
        html = html.replace(new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        if (text) {
          text = text.replace(new RegExp(ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        }
      });
    }

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      priority: EmailPriority.NORMAL
    });
  }

  /**
  /**
   * Helper to resolve a friendly display order ID from a database order ID (UUID).
   */
  private static async resolveDisplayOrderId(orderId: string): Promise<string> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return orderId;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('created_at')
        .eq('id', orderId)
        .single();
      
      if (fetchError || !data?.created_at) {
        console.warn('⚠️ Could not fetch created_at for order:', orderId, fetchError);
        return orderId;
      }
      
      const dateStr = data.created_at;

      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', dateStr);

      const seq = error || count === null ? 1 : count;
      const { formatOrderNumber } = await import('../utils/sequenceNumberUtils');
      return formatOrderNumber(dateStr, seq);
    } catch (err) {
      console.error('Error resolving display order ID:', err);
      return orderId;
    }
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderData: {
      orderId: string;
      orderDate: string;
      totalAmount: number;
      items: Array<{
        title: string;
        quantity: number;
        price: number;
        mainImage?: string;
        pdfUrl?: string;
        productType?: string;
      }>;
      downloadLinks: string[];
    }
  ): Promise<EmailResult> {
    const { getGSTRate, calculateInclusiveGST } = await import('../utils/gstUtils');
    
    // Calculate total inclusive GST
    const totalGst = orderData.items.reduce((sum, item) => {
      const rate = getGSTRate(item.productType);
      const itemTotal = item.price * item.quantity;
      return sum + calculateInclusiveGST(itemTotal, rate);
    }, 0);

    const itemsHtml = orderData.items.map(item => {
      const typeLabel = item.productType === 'digital' ? 'Digital Download'
        : item.productType === 'poster' ? 'Poster' : '';
      return `
      <div class="item-row">
        <div class="item-left">
          <div class="item-title">${item.title}</div>
          <div class="item-meta">Qty: ${item.quantity}${typeLabel ? ` · ${typeLabel}` : ''}</div>
        </div>
        <div class="item-right">
          <div class="item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        </div>
      </div>`;
    }).join('');

    const itemsText = orderData.items.map(item => 
      `- ${item.title} (Qty: ${item.quantity}) - ₹${item.price}`
    ).join('\n');

    const downloadLinksHtml = orderData.downloadLinks.map((link, index) => 
      `<a href="${link}" class="download-btn">Download Artwork ${orderData.downloadLinks.length > 1 ? index + 1 : ''}</a>`
    ).join('');

    const downloadLinksText = orderData.downloadLinks.map((link, index) => 
      `${index + 1}. ${link}`
    ).join('\n');

    // Only include download section if there are download links
    const downloadSection = orderData.downloadLinks.length > 0 ? `
    <div class="section">
      <div class="section-title">Download Your Artwork</div>
      <div class="download-block">
        <p>Your digital artwork is ready. Click below to download:</p>
        ${downloadLinksHtml}
      </div>
    </div>` : '';

    // Fetch the actual database created_at time to guarantee sequence order and date match PaymentSuccess exactly
    let actualCreatedAt = orderData.orderDate;
    try {
      const { data } = await supabase
        .from('orders')
        .select('created_at')
        .eq('id', orderData.orderId)
        .single();
      if (data?.created_at) {
        actualCreatedAt = data.created_at;
      }
    } catch (dbErr) {
      console.error('⚠️ Failed to fetch actual order created_at from database:', dbErr);
    }

    const displayOrderId = await this.resolveDisplayOrderId(orderData.orderId);
    const formattedOrderDate = new Date(actualCreatedAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return this.sendTemplateEmail(
      EmailType.ORDER_CONFIRMATION,
      { email: customerEmail, name: customerName },
      {
        customerName,
        orderId: displayOrderId,
        orderDate: formattedOrderDate,
        totalAmount: orderData.totalAmount.toLocaleString('en-IN'),
        items: itemsHtml,
        itemsText,
        downloadLinks: downloadLinksHtml,
        downloadSection,
        downloadLinksText,
        gstAmount: totalGst.toFixed(0)
      }
    );
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<EmailResult> {
    return this.sendTemplateEmail(
      EmailType.WELCOME,
      { email: userEmail, name: userName },
      {
        userName,
        dashboardUrl: `${window.location.origin}/dashboard`
      }
    );
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<EmailResult> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    return this.sendTemplateEmail(
      EmailType.PASSWORD_RESET,
      { email: userEmail, name: userName },
      {
        userName,
        resetUrl
      }
    );
  }

  /**
   * Send return request notification email to returns@lurevi.in
   */
  static async sendReturnRequestNotification(
    returnData: {
      returnId: string;
      orderId: string;
      customerName: string;
      customerEmail: string;
      productTitle: string;
      quantity: number;
      totalPrice: number;
      reason: string;
      customerNotes: string;
      requestDate: string;
    }
  ): Promise<EmailResult> {
    const adminUrl = `${window.location.origin}/admin/returns`;
    const displayOrderId = await this.resolveDisplayOrderId(returnData.orderId);
    
    return this.sendTemplateEmail(
      EmailType.RETURN_REQUEST,
      { email: 'returns@lurevi.in', name: 'Returns Team' },
      {
        returnId: returnData.returnId,
        orderId: displayOrderId,
        customerName: returnData.customerName,
        customerEmail: returnData.customerEmail,
        productTitle: returnData.productTitle,
        quantity: returnData.quantity.toString(),
        totalPrice: returnData.totalPrice.toFixed(2),
        reason: returnData.reason,
        customerNotes: returnData.customerNotes || 'No additional notes provided',
        requestDate: returnData.requestDate,
        adminUrl
      },
      `New Return Request - Order #${displayOrderId}`
    );
  }

  /**
   * Send return confirmation to customer
   */
  static async sendReturnConfirmationToCustomer(
    customerEmail: string,
    customerName: string,
    returnData: {
      orderId: string;
      productTitle: string;
      reason: string;
      quantity: number;
    }
  ): Promise<EmailResult> {
    const displayOrderId = await this.resolveDisplayOrderId(returnData.orderId);
    return this.sendTemplateEmail(
      EmailType.RETURN_CONFIRMATION_CUSTOMER,
      { email: customerEmail, name: customerName },
      {
        customerName,
        orderId: displayOrderId,
        productTitle: returnData.productTitle,
        reason: returnData.reason,
        quantity: returnData.quantity.toString()
      }
    );
  }

  /**
   * Send return approved email to customer
   */
  static async sendReturnApproved(
    customerEmail: string,
    customerName: string,
    returnData: {
      orderId: string;
      productTitle: string;
      quantity: number;
      totalPrice: number;
      adminNotes: string;
    }
  ): Promise<EmailResult> {
    const adminNotesSection = returnData.adminNotes ? `
      <div class="details" style="border-left: 4px solid #f59e0b; padding-left: 10px; margin: 15px 0;">
        <h2>Notes from Lurevi Team</h2>
        <p>${returnData.adminNotes}</p>
      </div>
    ` : '';

    const displayOrderId = await this.resolveDisplayOrderId(returnData.orderId);

    return this.sendTemplateEmail(
      EmailType.RETURN_APPROVED,
      { email: customerEmail, name: customerName },
      {
        customerName,
        orderId: displayOrderId,
        productTitle: returnData.productTitle,
        quantity: returnData.quantity.toString(),
        totalPrice: returnData.totalPrice.toFixed(2),
        adminNotesSection
      }
    );
  }

  /**
   * Send return rejected email to customer
   */
  static async sendReturnRejected(
    customerEmail: string,
    customerName: string,
    returnData: {
      orderId: string;
      productTitle: string;
      adminNotes: string;
    }
  ): Promise<EmailResult> {
    const adminNotesSection = returnData.adminNotes ? `
      <div class="details" style="border-left: 4px solid #ef4444; padding-left: 10px; margin: 15px 0;">
        <h2>Notes from Lurevi Team</h2>
        <p>${returnData.adminNotes}</p>
      </div>
    ` : '';

    const displayOrderId = await this.resolveDisplayOrderId(returnData.orderId);

    return this.sendTemplateEmail(
      EmailType.RETURN_REJECTED,
      { email: customerEmail, name: customerName },
      {
        customerName,
        orderId: displayOrderId,
        productTitle: returnData.productTitle,
        adminNotesSection
      }
    );
  }

  /**
   * Send refund confirmation email to customer
   */
  static async sendRefundConfirmation(
    customerEmail: string,
    customerName: string,
    refundData: {
      orderId: string;
      productTitle: string;
      refundAmount: number;
      refundMethod: string;
      adminNotes: string;
    }
  ): Promise<EmailResult> {
    const adminNotesSection = refundData.adminNotes ? `
      <div class="details" style="border-left: 4px solid #f59e0b; padding-left: 10px; margin: 15px 0;">
        <h2>Notes from Lurevi Team</h2>
        <p>${refundData.adminNotes}</p>
      </div>
    ` : '';

    const displayOrderId = await this.resolveDisplayOrderId(refundData.orderId);

    return this.sendTemplateEmail(
      EmailType.REFUND_CONFIRMATION,
      { email: customerEmail, name: customerName },
      {
        customerName,
        orderId: displayOrderId,
        productTitle: refundData.productTitle,
        refundAmount: refundData.refundAmount.toFixed(2),
        refundMethod: refundData.refundMethod || 'Original Payment Method',
        adminNotesSection
      }
    );
  }

  /**
   * Send bulk emails (for newsletters, marketing)
   */
  static async sendBulkEmails(
    recipients: EmailRecipient[],
    subject: string,
    html: string,
    text?: string
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    
    // Process in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(recipient => 
        this.sendEmail({
          to: recipient,
          subject,
          html,
          text,
          priority: EmailPriority.LOW
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Send email via Supabase Edge Function (real SMTP)
   */
  private static async sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const firstRecipient = recipients[0];

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: firstRecipient.email,
          toName: firstRecipient.name || '',
          subject: options.subject,
          html: options.html || '',
          text: options.text || '',
          replyTo: options.replyTo || emailConfig.replyTo.email || '',
          smtpConfig: options.smtpConfig || undefined,
        },
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          try {
            const errorBody = await error.context.json();
            const detailedError =
              errorBody?.error ||
              errorBody?.message ||
              'Edge Function returned non-2xx response';
            console.error('Edge Function HTTP error details:', errorBody);
            return { success: false, error: detailedError };
          } catch {
            return { success: false, error: error.message || 'Edge Function HTTP error' };
          }
        }

        console.error('Edge Function error:', error);
        return { success: false, error: error.message || 'Edge Function call failed' };
      }

      if (data?.success) {
        return { success: true, messageId: data.messageId };
      }

      return { success: false, error: data?.error || 'Unknown email error' };
    } catch (err) {
      console.error('Email send network error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error sending email',
      };
    }
  }

  /**
   * Check rate limiting
   */
  private static checkRateLimit(): boolean {
    const now = Date.now();
    const hourKey = Math.floor(now / (1000 * 60 * 60));
    const dayKey = Math.floor(now / (1000 * 60 * 60 * 24));
    
    const hourlyCount = this.rateLimitTracker[`hour_${hourKey}`] || 0;
    const dailyCount = this.rateLimitTracker[`day_${dayKey}`] || 0;
    
    return hourlyCount < emailConfig.rateLimit.maxEmailsPerHour && 
           dailyCount < emailConfig.rateLimit.maxEmailsPerDay;
  }

  /**
   * Update rate limit counters
   */
  private static updateRateLimit(): void {
    const now = Date.now();
    const hourKey = Math.floor(now / (1000 * 60 * 60));
    const dayKey = Math.floor(now / (1000 * 60 * 60 * 24));
    
    this.rateLimitTracker[`hour_${hourKey}`] = (this.rateLimitTracker[`hour_${hourKey}`] || 0) + 1;
    this.rateLimitTracker[`day_${dayKey}`] = (this.rateLimitTracker[`day_${dayKey}`] || 0) + 1;
    
    // Clean up old entries
    Object.keys(this.rateLimitTracker).forEach(key => {
      const keyTime = parseInt(key.split('_')[1]);
      const timeDiff = Math.abs(now - keyTime * (key.startsWith('hour_') ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24));
      if (timeDiff > 2 * (key.startsWith('hour_') ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24)) {
        delete this.rateLimitTracker[key];
      }
    });
  }

  /**
   * Get email statistics
   */
  static getEmailStats(): {
    sentToday: number;
    sentThisHour: number;
    rateLimitRemaining: {
      hourly: number;
      daily: number;
    };
  } {
    const now = Date.now();
    const hourKey = Math.floor(now / (1000 * 60 * 60));
    const dayKey = Math.floor(now / (1000 * 60 * 60 * 24));
    
    const sentToday = this.rateLimitTracker[`day_${dayKey}`] || 0;
    const sentThisHour = this.rateLimitTracker[`hour_${hourKey}`] || 0;
    
    return {
      sentToday,
      sentThisHour,
      rateLimitRemaining: {
        hourly: Math.max(0, emailConfig.rateLimit.maxEmailsPerHour - sentThisHour),
        daily: Math.max(0, emailConfig.rateLimit.maxEmailsPerDay - sentToday)
      }
    };
  }
}

export default EmailService;




