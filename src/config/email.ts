// Email configuration for Hostinger SMTP
export const emailConfig = {
  // Hostinger SMTP settings
  smtp: {
    host: import.meta.env.VITE_SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
    secure: import.meta.env.VITE_SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: import.meta.env.VITE_SMTP_USER || '',
      pass: import.meta.env.VITE_SMTP_PASS || ''
    }
  },
  
  // Email settings
  from: {
    name: import.meta.env.VITE_EMAIL_FROM_NAME || 'Artistic Pro',
    email: import.meta.env.VITE_EMAIL_FROM_EMAIL || ''
  },
  
  // Reply-to settings
  replyTo: {
    name: import.meta.env.VITE_EMAIL_REPLY_NAME || 'Artistic Pro Support',
    email: import.meta.env.VITE_EMAIL_REPLY_EMAIL || ''
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
  ADMIN_NOTIFICATION = 'admin_notification'
}

// Email priority levels
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export default emailConfig;
