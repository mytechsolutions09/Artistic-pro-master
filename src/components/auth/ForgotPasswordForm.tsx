import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAppearance } from '../../contexts/AppearanceContext';
import { useLogo } from '../../hooks/useLogo';
import AuthIllustration from './AuthIllustration';
import ArtLoader from './ArtLoader';
import { PasswordResetService } from '../../services/passwordResetService';

const ForgotPasswordForm: React.FC = () => {
  const { settings, loading: appearanceLoading } = useAppearance();
  const { logoUrl, loading: logoLoading, error: logoError } = useLogo();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the new PasswordResetService with Hostinger SMTP
      const result = await PasswordResetService.requestPasswordReset(email.trim());

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state without white container
  if (appearanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <ArtLoader />
      </div>
    );
  }

  if (success) {
    return (
      <div 
        className="p-2 sm:p-4 lg:min-h-screen lg:flex lg:items-center lg:justify-center"
        style={{
          background: `linear-gradient(to bottom right, ${settings.themeColors.lightPink}, ${settings.themeColors.pink}, ${settings.themeColors.darkPink})`
        }}
      >
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden my-4 sm:my-8 lg:my-0">
          <div className="flex flex-col lg:flex-row lg:h-[450px] xl:h-[500px]">
            {/* Left Side - Success Illustration */}
            <div className="lg:w-1/2 bg-white flex flex-col justify-center h-[150px] sm:h-[200px] md:h-[250px] lg:h-[450px] xl:h-[500px]">
              <div className="w-full h-full">
                <AuthIllustration />
              </div>
            </div>


            {/* Right Side - Success Message */}
            <div className="lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-center py-4 sm:py-6 md:py-8 lg:h-[450px] xl:h-[500px]">
              <div className="max-w-xs sm:max-w-sm mx-auto w-full">
                {/* Logo */}
                <div className="flex items-center justify-center mb-4">
                  <Link 
                    to="/"
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                  >
                    {logoLoading ? (
                      <div className="h-12 w-24 bg-gray-200 animate-pulse rounded"></div>
                    ) : logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="h-12 w-auto"
                        onError={(e) => {
                          console.error('Error loading logo from Supabase:', e);
                          e.currentTarget.src = '/lurevi-logo.svg';
                        }}
                      />
                    ) : (
                      <img 
                        src="/lurevi-logo.svg" 
                        alt="Lurevi" 
                        className="h-12 w-auto"
                      />
                    )}
                  </Link>
                </div>

                {/* Success Message */}
                <div className="mb-4">
                  <h1 className="text-lg font-bold text-gray-900 mb-1">Check Your Email</h1>
                  <p className="text-gray-600 text-sm">We've sent a password reset link to your email</p>
                </div>

                {/* Success Details */}
                <div className="space-y-3">
                  <div className="rounded-md bg-blue-50 p-3 border border-blue-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-xs font-medium text-blue-800">
                          Password reset link sent to {email}
                        </h3>
                        <p className="text-xs text-blue-600 mt-1">
                          Check your inbox and click the link to reset your password.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/sign-in"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      style={{ 
                        background: `linear-gradient(to right, ${settings.themeColors.pink}, ${settings.themeColors.darkPink})`,
                        '--tw-ring-color': settings.themeColors.pink
                      } as React.CSSProperties}
                    >
                      Back to Sign In
                    </Link>
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail('');
                      }}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ '--tw-ring-color': settings.themeColors.pink } as React.CSSProperties}
                    >
                      Send Another Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:flex lg:items-center lg:justify-center"
      style={{
        background: `linear-gradient(to bottom right, ${settings.themeColors.lightPink}, ${settings.themeColors.pink}, ${settings.themeColors.darkPink})`
      }}
    >
        <div className="w-full max-w-4xl lg:max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[500px]">
            {/* Left Side - Illustration Section */}
            <div className="lg:w-1/2 bg-white flex flex-col justify-center h-[200px] sm:h-[250px] md:h-[300px] lg:h-auto">
            {/* Illustration */}
            <div className="w-full h-full">
              <AuthIllustration />
            </div>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="lg:w-1/2 bg-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Logo */}
              <div className="flex items-center justify-center mb-4">
                <Link 
                  to="/"
                  className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                >
                  {logoLoading ? (
                    <div className="h-12 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        console.error('Error loading logo from Supabase:', e);
                        e.currentTarget.src = '/lurevi-logo.svg';
                      }}
                    />
                  ) : (
                    <img 
                      src="/lurevi-logo.svg" 
                      alt="Lurevi" 
                      className="h-12 w-auto"
                    />
                  )}
                </Link>
              </div>

              {/* Back to Login Link */}
              <div className="mb-4">
                <Link
                  to="/sign-in"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>

              {/* Welcome Message */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-600 text-sm sm:text-base">Enter your email address and we'll send you a link to reset your password</p>
              </div>

              {/* Forgot Password Form */}
              <form className="space-y-4 sm:space-y-5" onSubmit={handleForgotPassword}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-3 sm:py-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm sm:text-base"
                    placeholder="Enter your email address"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 sm:py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ 
                    background: `linear-gradient(to right, ${settings.themeColors.pink}, ${settings.themeColors.darkPink})`,
                    '--tw-ring-color': settings.themeColors.pink
                  } as React.CSSProperties}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Additional Help */}
              <div className="mt-4 sm:mt-5 text-center">
                <p className="text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link
                    to="/sign-in"
                    className="font-medium transition-colors"
                    style={{ 
                      color: settings.themeColors.pink,
                      '--tw-text-opacity': '1'
                    } as React.CSSProperties}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
