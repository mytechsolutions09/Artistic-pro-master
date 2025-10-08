import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppearance } from '../../contexts/AppearanceContext';
import { useLogo } from '../../hooks/useLogo';
import AuthIllustration from './AuthIllustration';
import ArtLoader from './ArtLoader';

const SignUpForm: React.FC = () => {
  const { settings, loading: appearanceLoading } = useAppearance();
  const { logoUrl, loading: logoLoading, error: logoError } = useLogo();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
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
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/sign-in`,
          data: {
            full_name: fullName,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email_confirm: true
          }
        }
      });

      if (error) throw error;

      if (data.user) {

        setSuccess(true);
        setError(null);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      if (err instanceof Error) {
        if (err.message.includes('already registered')) {
          setError('This email is already registered. Please try signing in instead.');
        } else if (err.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Sign up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state without white container
  if (appearanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-800">
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
                  <h1 className="text-lg font-bold text-gray-900 mb-1">Account Created!</h1>
                  <p className="text-gray-600 text-sm">Check your email to verify your account</p>
                </div>

                {/* Success Details */}
                <div className="space-y-3">
                  <div className="rounded-md bg-green-50 p-2 border border-green-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-xs font-medium text-green-800">
                          Success! We've sent a verification link to your email address.
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to="/sign-in"
                      className="w-full flex justify-center py-1.5 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      style={{ 
                        background: `linear-gradient(to right, ${settings.themeColors.pink}, ${settings.themeColors.darkPink})`,
                        '--tw-ring-color': settings.themeColors.pink
                      } as React.CSSProperties}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/"
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ '--tw-ring-color': settings.themeColors.pink } as React.CSSProperties}
                    >
                      Go to Homepage
                    </Link>
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
      className="min-h-screen p-4 sm:p-6 lg:flex lg:items-center lg:justify-center bg-teal-800"
    >
        <div className="w-full max-w-3xl lg:max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[500px]">
            {/* Left Side - Illustration Section */}
            <div className="lg:w-1/2 bg-white flex flex-col justify-center h-[150px] sm:h-[180px] md:h-[200px] lg:h-auto">
            {/* Illustration */}
            <div className="w-full h-full">
              <AuthIllustration />
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="lg:w-1/2 bg-white p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Logo */}
              <div className="flex items-center justify-center mb-3">
                <Link 
                  to="/"
                  className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                >
                  {logoLoading ? (
                    <div className="h-16 w-32 bg-gray-200 animate-pulse rounded"></div>
                  ) : logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-16 w-auto"
                      onError={(e) => {
                        console.error('Error loading logo from Supabase:', e);
                        e.currentTarget.src = '/lurevi-logo.svg';
                      }}
                    />
                  ) : (
                    <img 
                      src="/lurevi-logo.svg" 
                      alt="Lurevi" 
                      className="h-16 w-auto"
                    />
                  )}
                </Link>
              </div>

              {/* Welcome Message */}
              <div className="mb-4">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Create Account</h1>
              </div>

              {/* Sign Up Form */}
              <form className="space-y-3" onSubmit={handleSignUp}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-sm"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-sm"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                    Password
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
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm"
                      placeholder="Create a password"
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
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm Password
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
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm"
                      placeholder="Confirm your password"
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
                  <div className="rounded-md bg-red-50 p-2 border border-red-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-3 w-3 text-red-400" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-xs font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  Already have an account?{' '}
                  <Link
                    to="/sign-in"
                    className="font-medium text-teal-600 hover:text-teal-700 transition-colors"
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

export default SignUpForm;
