import { supabase } from './supabaseService';

export interface PhoneAuthResult {
  success: boolean;
  error?: string;
  session?: any;
}

class PhoneAuthService {
  private readonly COUNTRY_CODE = '+91'; // India
  private readonly PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile numbers start with 6-9

  /**
   * Format phone number to E.164 format (+91XXXXXXXXXX)
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If already has country code, return as is
    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }
    
    // Add country code if 10 digits
    if (digits.length === 10) {
      return `${this.COUNTRY_CODE}${digits}`;
    }
    
    return phone;
  }

  /**
   * Validate Indian phone number
   */
  validatePhoneNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's 10 digits and starts with 6-9
    if (digits.length === 10) {
      return this.PHONE_REGEX.test(digits);
    }
    
    // Check if it's 12 digits with 91 prefix
    if (digits.length === 12 && digits.startsWith('91')) {
      return this.PHONE_REGEX.test(digits.substring(2));
    }
    
    return false;
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<PhoneAuthResult> {
    try {
      // Validate phone number
      if (!this.validatePhoneNumber(phone)) {
        return {
          success: false,
          error: 'Invalid Indian phone number. Please enter a valid 10-digit mobile number.'
        };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phone);
      
      console.log('Sending OTP to:', formattedPhone);

      // Send OTP using Supabase Auth
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          // Optional: customize OTP behavior
          channel: 'sms',
        }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        
        // Handle specific errors
        if (error.message.includes('rate limit')) {
          return {
            success: false,
            error: 'Too many attempts. Please try again after some time.'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Failed to send OTP. Please try again.'
        };
      }

      console.log('OTP sent successfully:', data);

      return {
        success: true,
        session: data
      };
    } catch (error: any) {
      console.error('Exception sending OTP:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string): Promise<PhoneAuthResult> {
    try {
      // Validate inputs
      if (!this.validatePhoneNumber(phone)) {
        return {
          success: false,
          error: 'Invalid phone number.'
        };
      }

      if (!otp || otp.length !== 6) {
        return {
          success: false,
          error: 'Please enter a valid 6-digit OTP.'
        };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phone);
      
      console.log('Verifying OTP for:', formattedPhone);

      // Verify OTP using Supabase Auth
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        
        // Handle specific errors
        if (error.message.includes('expired')) {
          return {
            success: false,
            error: 'OTP has expired. Please request a new one.'
          };
        }
        
        if (error.message.includes('invalid')) {
          return {
            success: false,
            error: 'Invalid OTP. Please check and try again.'
          };
        }
        
        return {
          success: false,
          error: error.message || 'Failed to verify OTP. Please try again.'
        };
      }

      console.log('OTP verified successfully:', data);

      return {
        success: true,
        session: data
      };
    } catch (error: any) {
      console.error('Exception verifying OTP:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(phone: string): Promise<PhoneAuthResult> {
    return this.sendOTP(phone);
  }

  /**
   * Get current phone auth session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      return data.session;
    } catch (error) {
      console.error('Exception getting session:', error);
      return null;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception signing out:', error);
      return false;
    }
  }
}

export default new PhoneAuthService();

