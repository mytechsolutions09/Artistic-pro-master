import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim()
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-400 to-pink-600 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left Side - Success Illustration */}
            <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-between">
              {/* Logo */}
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>

              {/* Success Illustration */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
                  <div className="relative">
                    {/* Success Building */}
                    <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg relative overflow-hidden">
                      {/* Checkmark Windows */}
                      <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-2">
                        <div className="h-8 bg-green-200 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="h-8 bg-green-200 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="h-8 bg-green-200 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="absolute top-12 left-4 right-4 grid grid-cols-3 gap-2">
                        <div className="h-8 bg-green-200 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="h-8 bg-green-200 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="h-8 bg-green-200 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      
                      {/* Success Art Pieces */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                        <div className="w-12 h-16 bg-gradient-to-br from-green-200 to-green-300 rounded"></div>
                        <div className="w-12 h-16 bg-gradient-to-br from-green-300 to-green-400 rounded"></div>
                        <div className="w-12 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Floating Success Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-200 rounded-full opacity-60"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-300 rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Success Message */}
            <div className="lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                {/* Success Message */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h1>
                  <p className="text-gray-600 text-sm">Your password has been successfully reset</p>
                </div>

                {/* Success Details */}
                <div className="space-y-6">
                  <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Your password has been successfully updated.
                        </h3>
                        <p className="text-xs text-green-600 mt-1">
                          You can now sign in with your new password.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      to="/sign-in"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Sign In Now
                    </Link>
                    <p className="text-xs text-gray-500 text-center">
                      Redirecting to sign in page in 3 seconds...
                    </p>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-400 to-pink-600 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl lg:max-w-6xl bg-white rounded-lg shadow-lg">
        <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[500px]">
          {/* Left Side - Illustration Section */}
          <div className="lg:w-1/2 bg-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center h-[200px] sm:h-[250px] md:h-[300px] lg:h-auto">
            {/* Logo */}
            <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">A</span>
              </div>
            </div>

            {/* Illustration */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md">
                {/* Art Gallery Illustration */}
                <div className="relative">
                  {/* Gallery Building */}
                  <div className="w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg relative overflow-hidden">
                    {/* Windows */}
                    <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-2">
                      <div className="h-8 bg-white/60 rounded"></div>
                      <div className="h-8 bg-white/60 rounded"></div>
                      <div className="h-8 bg-white/60 rounded"></div>
                    </div>
                    <div className="absolute top-12 left-4 right-4 grid grid-cols-3 gap-2">
                      <div className="h-8 bg-white/60 rounded"></div>
                      <div className="h-8 bg-white/60 rounded"></div>
                      <div className="h-8 bg-white/60 rounded"></div>
                    </div>
                    
                    {/* Art Pieces */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      <div className="w-12 h-16 bg-gradient-to-br from-pink-200 to-pink-300 rounded"></div>
                      <div className="w-12 h-16 bg-gradient-to-br from-pink-300 to-pink-400 rounded"></div>
                      <div className="w-12 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-pink-200 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-300 rounded-full opacity-60"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Reset Password Form */}
          <div className="lg:w-1/2 bg-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600 text-sm sm:text-base">Enter your new password below</p>
              </div>

              {/* Reset Password Form */}
              <form className="space-y-4 sm:space-y-6" onSubmit={handleResetPassword}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
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
                  className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              {/* Additional Help */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link
                    to="/sign-in"
                    className="font-medium text-pink-500 hover:text-pink-600 transition-colors"
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

export default ResetPasswordForm;
