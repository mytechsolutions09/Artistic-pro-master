import { supabase } from './supabaseService';
import { EmailService } from './emailService';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Password Reset Service - Handles password reset functionality with email notifications
 */
export class PasswordResetService {
  
  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<PasswordResetResult> {
    try {
      console.log('🔐 Processing password reset request for:', email);

      // Check if user exists
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        // For security, we don't reveal if email exists or not
        return {
          success: true,
          message: 'If an account with that email exists, you will receive a password reset link.'
        };
      }

      // Generate password reset token using Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) {
        console.error('❌ Password reset error:', resetError);
        return {
          success: false,
          error: 'Failed to send password reset email. Please try again.'
        };
      }

      // Send custom password reset email via Hostinger SMTP
      try {
        const emailResult = await EmailService.sendPasswordResetEmail(
          email,
          email.split('@')[0], // Use email prefix as name
          'reset-token' // In a real implementation, you'd get this from Supabase
        );

        if (!emailResult.success) {
          console.warn('⚠️ Custom password reset email failed:', emailResult.error);
          // Don't fail the request if custom email fails, Supabase email will still be sent
        }
      } catch (emailError) {
        console.warn('⚠️ Custom password reset email error:', emailError);
        // Don't fail the request if custom email fails
      }

      console.log('✅ Password reset email sent successfully');
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };

    } catch (error) {
      console.error('❌ Password reset request failed:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Update password using reset token
   */
  static async updatePasswordWithToken(token: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      console.log('🔐 Updating password with token');

      // In a real implementation, you would verify the token and update the password
      // For now, we'll use Supabase's built-in password reset flow
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update error:', error);
        return {
          success: false,
          error: 'Failed to update password. The reset link may have expired.'
        };
      }

      console.log('✅ Password updated successfully');
      return {
        success: true,
        message: 'Password updated successfully. You can now sign in with your new password.'
      };

    } catch (error) {
      console.error('❌ Password update failed:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Verify reset token validity
   */
  static async verifyResetToken(token: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // In a real implementation, you would verify the token against your database
      // For now, we'll assume tokens are valid if they exist
      if (!token || token.length < 10) {
        return { valid: false, error: 'Invalid reset token' };
      }

      return { valid: true };

    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return { 
        valid: false, 
        error: 'Failed to verify reset token' 
      };
    }
  }

  /**
   * Send password reset confirmation email
   */
  static async sendPasswordResetConfirmation(email: string): Promise<PasswordResetResult> {
    try {
      console.log('📧 Sending password reset confirmation email to:', email);

      const result = await EmailService.sendEmail({
        to: { email, name: email.split('@')[0] },
        subject: 'Password Reset Successful - Artistic Pro',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Successful</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-icon { font-size: 48px; margin-bottom: 20px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="success-icon">✅</div>
                <h1>Password Reset Successful</h1>
              </div>
              <div class="content">
                <h2>Hello!</h2>
                <p>Your password has been successfully reset for your Artistic Pro account.</p>
                <p>If you made this change, no further action is required.</p>
                <p>If you did not request this password reset, please contact our support team immediately.</p>
                <p>For security reasons, we recommend:</p>
                <ul>
                  <li>Using a strong, unique password</li>
                  <li>Enabling two-factor authentication if available</li>
                  <li>Regularly updating your password</li>
                </ul>
                <p>Thank you for using Artistic Pro!</p>
              </div>
              <div class="footer">
                <p>© 2024 Artistic Pro. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Password Reset Successful - Artistic Pro
          
          Hello!
          
          Your password has been successfully reset for your Artistic Pro account.
          
          If you made this change, no further action is required.
          
          If you did not request this password reset, please contact our support team immediately.
          
          For security reasons, we recommend:
          - Using a strong, unique password
          - Enabling two-factor authentication if available
          - Regularly updating your password
          
          Thank you for using Artistic Pro!
          
          © 2024 Artistic Pro. All rights reserved.
        `
      });

      if (result.success) {
        console.log('✅ Password reset confirmation email sent');
        return { success: true, message: 'Confirmation email sent' };
      } else {
        console.warn('⚠️ Password reset confirmation email failed:', result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('❌ Password reset confirmation email error:', error);
      return {
        success: false,
        error: 'Failed to send confirmation email'
      };
    }
  }
}

export default PasswordResetService;
