import { supabase } from './supabaseService';

export interface PhoneAuthResult {
  success: boolean;
  error?: string;
  session?: any;
  userId?: string;
}

class PhoneAuthService {
  private readonly COUNTRY_CODE = '+91'; // India
  private readonly PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile numbers start with 6-9
  private readonly EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp-msg91`;

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
   * Send OTP to phone number via MSG91
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
      
      console.log('Sending OTP via MSG91 to:', formattedPhone);

      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call Supabase Edge Function to send OTP via MSG91
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          action: 'send'
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error sending OTP via MSG91:', result);
        
        // Handle specific errors
        if (result.error?.includes('rate limit') || result.error?.includes('Too many')) {
          return {
            success: false,
            error: 'Too many attempts. Please try again after some time.'
          };
        }
        
        return {
          success: false,
          error: result.error || 'Failed to send OTP. Please try again.'
        };
      }

      console.log('OTP sent successfully via MSG91');

      return {
        success: true,
        session: result
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
   * Verify OTP via MSG91
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
      
      console.log('Verifying OTP via MSG91 for:', formattedPhone);

      // Call Supabase Edge Function to verify OTP
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          action: 'verify',
          otp: otp
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error verifying OTP:', result);
        
        // Handle specific errors
        if (result.error?.includes('expired')) {
          return {
            success: false,
            error: 'OTP has expired. Please request a new one.'
          };
        }
        
        if (result.error?.includes('invalid') || result.error?.includes('Invalid')) {
          return {
            success: false,
            error: 'Invalid OTP. Please check and try again.'
          };
        }

        if (result.error?.includes('Too many')) {
          return {
            success: false,
            error: 'Too many attempts. Please request a new OTP.'
          };
        }
        
        return {
          success: false,
          error: result.error || 'Failed to verify OTP. Please try again.'
        };
      }

      console.log('OTP verified successfully via MSG91:', result);

      // After successful OTP verification, sign in the user using phone
      // This creates or updates the user session in Supabase Auth
      if (result.userId) {
        // Sign in with phone using the verified phone number
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });

        if (authError) {
          console.error('Auth error after OTP verification:', authError);
        } else {
          console.log('User signed in successfully');
        }
      }

      return {
        success: true,
        session: result,
        userId: result.userId
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

