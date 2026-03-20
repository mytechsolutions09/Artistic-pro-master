// Email configuration for Hostinger SMTP
export const emailConfig = {
  // Hostinger SMTP settings
  smtp: {
    host: process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT || '465'),
    secure: process.env.NEXT_PUBLIC_SMTP_SECURE === 'true' || true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  
  // Hostinger IMAP settings
  imap: {
    host: process.env.NEXT_PUBLIC_IMAP_HOST || 'imap.hostinger.com',
    port: parseInt(process.env.NEXT_PUBLIC_IMAP_PORT || '993'),
    secure: true, // IMAP over SSL
    auth: {
      user: process.env.IMAP_USER || '',
      pass: process.env.IMAP_PASS || ''
    }
  },
  
  // Hostinger POP settings
  pop: {
    host: process.env.NEXT_PUBLIC_POP_HOST || 'pop.hostinger.com',
    port: parseInt(process.env.NEXT_PUBLIC_POP_PORT || '995'),
    secure: true, // POP over SSL
    auth: {
      user: process.env.POP_USER || '',
      pass: process.env.POP_PASS || ''
    }
  },
  
  // Email settings
  from: {
    name: process.env.NEXT_PUBLIC_EMAIL_FROM_NAME || 'Artistic Pro',
    email: process.env.NEXT_PUBLIC_EMAIL_FROM_EMAIL || ''
  },
  
  // Reply-to settings
  replyTo: {
    name: process.env.NEXT_PUBLIC_EMAIL_REPLY_NAME || 'Artistic Pro Support',
    email: process.env.NEXT_PUBLIC_EMAIL_REPLY_EMAIL || ''
  },
  
  // Email templates
  templates: {
    orderConfirmation: 'order-confirmation',
    welcome: 'welcome',
    passwordReset: 'password-reset',
    emailVerification: 'email-verification',
    newsletter: 'newsletter',
    marketing: 'marketing'
  },
  
  // Rate limiting
  rateLimit: {
    maxEmailsPerHour: 100,
    maxEmailsPerDay: 1000
  }
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Email types
export enum EmailType {
  ORDER_CONFIRMATION = 'order_confirmation',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  NEWSLETTER = 'newsletter',
  MARKETING = 'marketing',
  ADMIN_NOTIFICATION = 'admin_notification',
  RETURN_REQUEST = 'return_request'
}

// Email priority levels
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export default emailConfig;



