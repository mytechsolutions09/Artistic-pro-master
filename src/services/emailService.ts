import { emailConfig, EmailType, EmailPriority, isValidEmail } from '../config/email';

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
const emailTemplates: Record<string, EmailTemplate> = {
  [EmailType.ORDER_CONFIRMATION]: {
    subject: 'Order Confirmation - {{orderId}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .item:last-child { border-bottom: none; }
    .download-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .download-btn { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Order Confirmed!</h1>
      <p>Thank you for your purchase, \${'{customerName}'}!</p>
    </div>
    <div class="content">
      <div class="order-details">
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> \${'{orderId}'}</p>
        <p><strong>Order Date:</strong> \${'{orderDate}'}</p>
        <p><strong>Total Amount:</strong> $\${'{totalAmount}'}</p>
      </div>
      
      <div class="order-details">
        <h2>Your Items</h2>
        \${'{items}'}
      </div>
      
      <div class="download-section">
        <h2>📥 Download Your Artwork</h2>
        <p>Click the links below to download your purchased artwork:</p>
        \${'{downloadLinks}'}
      </div>
      
      <div class="order-details">
        <h2>Need Help?</h2>
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        <p>Email: support@artisticpro.com</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Artistic Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    text: `Order Confirmation - \${'{orderId}'}

Thank you for your purchase, \${'{customerName}'}!

Order Details:
- Order ID: \${'{orderId}'}
- Order Date: \${'{orderDate}'}
- Total Amount: $\${'{totalAmount}'}

Your Items:
\${'{itemsText}'}

Download Your Artwork:
\${'{downloadLinksText}'}

Need Help?
If you have any questions about your order, please contact us at support@artisticpro.com

© 2024 Artistic Pro. All rights reserved.`
  },
  
  [EmailType.WELCOME]: {
    subject: 'Welcome to Artistic Pro! 🎨',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Artistic Pro</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Welcome to Artistic Pro!</h1>
      <p>Your creative journey starts here</p>
    </div>
    <div class="content">
      <h2>Hello \${'{userName}'}!</h2>
      <p>Welcome to Artistic Pro, where creativity meets technology. We're thrilled to have you join our community of artists and art lovers.</p>
      
      <h3>What you can do:</h3>
      <ul>
        <li>✨ Browse our curated collection of digital artwork</li>
        <li>🛒 Purchase high-quality digital downloads</li>
        <li>👤 Create your personal art collection</li>
        <li>📧 Get notified about new releases</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="\${'{dashboardUrl}'}" class="cta-button">Explore Your Dashboard</a>
      </div>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>© 2024 Artistic Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
  },
  
  [EmailType.PASSWORD_RESET]: {
    subject: 'Reset Your Password - Artistic Pro',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reset-button { display: inline-block; background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello \${'{userName}'},</h2>
      <p>We received a request to reset your password for your Artistic Pro account.</p>
      
      <div style="text-align: center;">
        <a href="\${'{resetUrl}'}" class="reset-button">Reset My Password</a>
      </div>
      
      <div class="warning">
        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <p>For security reasons, never share this link with anyone.</p>
    </div>
    <div class="footer">
      <p>© 2024 Artistic Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
  },
  [EmailType.RETURN_REQUEST]: {
    subject: 'New Return Request - Order #{{orderId}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Request Notification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .return-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #6b7280; }
    .action-btn { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .urgent { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 New Return Request</h1>
      <p>A customer has requested a return</p>
    </div>
    <div class="content">
      <div class="urgent">
        <strong>⚠️ Action Required:</strong> A customer has initiated a return request. Please review and process it promptly.
      </div>
      
      <div class="return-details">
        <h2>Return Request Details</h2>
        <div class="info-row">
          <span class="label">Return ID:</span>
          <span class="value">\${'{returnId}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Order ID:</span>
          <span class="value">\${'{orderId}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer Name:</span>
          <span class="value">\${'{customerName}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer Email:</span>
          <span class="value">\${'{customerEmail}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Request Date:</span>
          <span class="value">\${'{requestDate}'}</span>
        </div>
      </div>
      
      <div class="return-details">
        <h2>Product Information</h2>
        <div class="info-row">
          <span class="label">Product:</span>
          <span class="value">\${'{productTitle}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Quantity:</span>
          <span class="value">\${'{quantity}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Amount:</span>
          <span class="value">₹\${'{totalPrice}'}</span>
        </div>
      </div>
      
      <div class="return-details">
        <h2>Return Reason</h2>
        <p><strong>\${'{reason}'}</strong></p>
        <p style="color: #6b7280; margin-top: 10px;">\${'{customerNotes}'}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="\${'{adminUrl}'}" class="action-btn">Review Return Request</a>
      </div>
      
      <div class="return-details">
        <h2>Next Steps</h2>
        <ol style="color: #6b7280;">
          <li>Review the return request details</li>
          <li>Approve or reject the return</li>
          <li>Schedule pickup with Delhivery if approved</li>
          <li>Process refund once item is received</li>
        </ol>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Lurevi. All rights reserved.</p>
      <p>This is an automated notification from your returns system.</p>
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

      // In a real implementation, you would use a library like nodemailer
      // For now, we'll simulate the email sending with Hostinger SMTP

      // Simulate SMTP connection and sending
      const result = await this.simulateSMTPEmail(options);
      
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
      const placeholder = `{{${key}}}`;
      const escapedPlaceholder = `\\$\\{'{${key}}'\\}`;
      const stringValue = String(value || '');
      
      subject = subject.replace(new RegExp(escapedPlaceholder, 'g'), stringValue);
      html = html.replace(new RegExp(escapedPlaceholder, 'g'), stringValue);
      if (text) {
        text = text.replace(new RegExp(escapedPlaceholder, 'g'), stringValue);
      }
    }

    // Clean up any remaining placeholders that weren't replaced
    const remainingPlaceholders = html.match(/\\\$\\{'\{[^}]+\}'\\}/g);
    if (remainingPlaceholders) {
      console.warn('⚠️ Remaining placeholders found:', remainingPlaceholders);
      remainingPlaceholders.forEach(placeholder => {
        html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        if (text) {
          text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
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
      }>;
      downloadLinks: string[];
    }
  ): Promise<EmailResult> {
    const itemsHtml = orderData.items.map(item => `
      <div class="item">
        <div>
          <strong>${item.title}</strong><br>
          <small>Quantity: ${item.quantity}</small>
        </div>
        <div>$${item.price}</div>
      </div>
    `).join('');

    const itemsText = orderData.items.map(item => 
      `- ${item.title} (Qty: ${item.quantity}) - $${item.price}`
    ).join('\n');

    const downloadLinksHtml = orderData.downloadLinks.map(link => 
      `<a href="${link}" class="download-btn">Download</a>`
    ).join('');

    const downloadLinksText = orderData.downloadLinks.map((link, index) => 
      `${index + 1}. ${link}`
    ).join('\n');

    return this.sendTemplateEmail(
      EmailType.ORDER_CONFIRMATION,
      { email: customerEmail, name: customerName },
      {
        customerName,
        orderId: orderData.orderId,
        orderDate: orderData.orderDate,
        totalAmount: orderData.totalAmount,
        items: itemsHtml,
        itemsText,
        downloadLinks: downloadLinksHtml,
        downloadLinksText
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
    
    return this.sendTemplateEmail(
      EmailType.RETURN_REQUEST,
      { email: 'returns@lurevi.in', name: 'Returns Team' },
      {
        returnId: returnData.returnId,
        orderId: returnData.orderId,
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
      `New Return Request - Order #${returnData.orderId}`
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
   * Simulate SMTP email sending (replace with actual nodemailer implementation)
   */
  private static async simulateSMTPEmail(options: EmailOptions): Promise<EmailResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        success: true,
        messageId
      };
    } else {
      return {
        success: false,
        error: 'SMTP server temporarily unavailable'
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
