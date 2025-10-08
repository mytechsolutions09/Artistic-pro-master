import React, { useState, useEffect } from 'react';
import { Smartphone, ArrowRight, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import phoneAuthService from '../../services/phoneAuthService';

interface PhoneLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PhoneLogin({ onSuccess, onError }: PhoneLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatPhoneInput = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    return digits.substring(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 6);
    setOtp(value);
    setError('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await phoneAuthService.sendOTP(phoneNumber);

    setLoading(false);

    if (result.success) {
      setStep('otp');
      setSuccessMessage('OTP sent successfully! Check your SMS.');
      setResendCooldown(60); // 60 second cooldown
    } else {
      setError(result.error || 'Failed to send OTP');
      if (onError) onError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await phoneAuthService.verifyOTP(phoneNumber, otp);

    setLoading(false);

    if (result.success) {
      setSuccessMessage('Login successful!');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
      }
    } else {
      setError(result.error || 'Invalid OTP');
      if (onError) onError(result.error || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const result = await phoneAuthService.resendOTP(phoneNumber);

    setLoading(false);

    if (result.success) {
      setSuccessMessage('OTP resent successfully!');
      setResendCooldown(60);
    } else {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Phone Number Step */}
      {step === 'phone' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">+91</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                required
                disabled={loading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Enter your 10-digit Indian mobile number
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phoneNumber.length !== 10}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* OTP Verification Step */}
      {step === 'otp' && (
        <div className="space-y-4">
          {/* Success message */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Phone number display */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">OTP sent to</p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-900">+91 {phoneNumber}</p>
              <button
                onClick={handleChangeNumber}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                required
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Enter the 6-digit code sent to your mobile
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Login</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-medium text-gray-700">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center space-x-1"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

