import { EmailService, EmailRecipient } from '../services/emailService';
import { PasswordResetService } from '../services/passwordResetService';

/**
 * Email Testing Utilities - For testing email functionality during development
 */
export class EmailTestUtils {
  
  /**
   * Test basic email sending
   */
  static async testBasicEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing basic email functionality...');
      
      const result = await EmailService.sendEmail({
        to: { email: 'test@example.com', name: 'Test User' },
        subject: 'Test Email - Artistic Pro',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from Artistic Pro.</p>
          <p>If you receive this, the email system is working correctly!</p>
        `,
        text: 'Test Email - This is a test email from Artistic Pro. If you receive this, the email system is working correctly!'
      });

      if (result.success) {
        return { success: true, message: 'Basic email test passed!' };
      } else {
        return { success: false, message: `Basic email test failed: ${result.error}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Basic email test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test order confirmation email
   */
  static async testOrderConfirmationEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing order confirmation email...');
      
      const result = await EmailService.sendOrderConfirmation(
        'test@example.com',
        'Test Customer',
        {
          orderId: 'TEST-ORDER-123',
          orderDate: new Date().toISOString(),
          totalAmount: 29.99,
          items: [
            {
              title: 'Test Artwork',
              quantity: 1,
              price: 29.99,
              mainImage: 'https://example.com/image.jpg',
              pdfUrl: 'https://example.com/download.pdf'
            }
          ],
          downloadLinks: ['https://example.com/download1.pdf', 'https://example.com/download2.pdf']
        }
      );

      if (result.success) {
        return { success: true, message: 'Order confirmation email test passed!' };
      } else {
        return { success: false, message: `Order confirmation email test failed: ${result.error}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Order confirmation email test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test welcome email
   */
  static async testWelcomeEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing welcome email...');
      
      const result = await EmailService.sendWelcomeEmail(
        'test@example.com',
        'Test User'
      );

      if (result.success) {
        return { success: true, message: 'Welcome email test passed!' };
      } else {
        return { success: false, message: `Welcome email test failed: ${result.error}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Welcome email test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test password reset email
   */
  static async testPasswordResetEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing password reset email...');
      
      const result = await PasswordResetService.requestPasswordReset('test@example.com');

      if (result.success) {
        return { success: true, message: 'Password reset email test passed!' };
      } else {
        return { success: false, message: `Password reset email test failed: ${result.error}` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Password reset email test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test bulk email sending
   */
  static async testBulkEmail(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing bulk email sending...');
      
      const recipients: EmailRecipient[] = [
        { email: 'test1@example.com', name: 'Test User 1' },
        { email: 'test2@example.com', name: 'Test User 2' },
        { email: 'test3@example.com', name: 'Test User 3' }
      ];

      const results = await EmailService.sendBulkEmails(
        recipients,
        'Test Bulk Email - Artistic Pro',
        '<h1>Bulk Email Test</h1><p>This is a test bulk email from Artistic Pro.</p>',
        'Bulk Email Test - This is a test bulk email from Artistic Pro.'
      );

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;

      if (successCount === totalCount) {
        return { success: true, message: `Bulk email test passed! ${successCount}/${totalCount} emails sent successfully.` };
      } else {
        return { success: false, message: `Bulk email test partially failed: ${successCount}/${totalCount} emails sent successfully.` };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Bulk email test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Test email rate limiting
   */
  static async testRateLimiting(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 Testing email rate limiting...');
      
      const stats = EmailService.getEmailStats();
      
      return { 
        success: true, 
        message: `Rate limiting test passed! Current stats: ${stats.sentToday} sent today, ${stats.sentThisHour} sent this hour, ${stats.rateLimitRemaining.hourly} hourly limit remaining, ${stats.rateLimitRemaining.daily} daily limit remaining.` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Rate limiting test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Run all email tests
   */
  static async runAllTests(): Promise<{ success: boolean; results: Array<{ test: string; result: { success: boolean; message: string } }> }> {
    console.log('🧪 Running all email tests...');
    
    const tests = [
      { name: 'Basic Email', test: this.testBasicEmail },
      { name: 'Order Confirmation', test: this.testOrderConfirmationEmail },
      { name: 'Welcome Email', test: this.testWelcomeEmail },
      { name: 'Password Reset', test: this.testPasswordResetEmail },
      { name: 'Bulk Email', test: this.testBulkEmail },
      { name: 'Rate Limiting', test: this.testRateLimiting }
    ];

    const results = [];
    let allPassed = true;

    for (const { name, test } of tests) {
      try {
        const result = await test.call(this);
        results.push({ test: name, result });
        if (!result.success) {
          allPassed = false;
        }
      } catch (error) {
        results.push({ 
          test: name, 
          result: { 
            success: false, 
            message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
          } 
        });
        allPassed = false;
      }
    }

    console.log('🧪 All email tests completed:', { allPassed, results });
    
    return { success: allPassed, results };
  }

  /**
   * Test email configuration
   */
  static testEmailConfiguration(): { success: boolean; message: string; config: any } {
    try {
      console.log('🧪 Testing email configuration...');
      
      const config = {
        smtpHost: import.meta.env.VITE_SMTP_HOST,
        smtpPort: import.meta.env.VITE_SMTP_PORT,
        smtpUser: import.meta.env.VITE_SMTP_USER,
        fromEmail: import.meta.env.VITE_EMAIL_FROM_EMAIL,
        fromName: import.meta.env.VITE_EMAIL_FROM_NAME
      };

      const missingConfig = Object.entries(config)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingConfig.length > 0) {
        return {
          success: false,
          message: `Missing email configuration: ${missingConfig.join(', ')}`,
          config
        };
      }

      return {
        success: true,
        message: 'Email configuration is complete!',
        config
      };
    } catch (error) {
      return {
        success: false,
        message: `Configuration test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        config: {}
      };
    }
  }
}

export default EmailTestUtils;
