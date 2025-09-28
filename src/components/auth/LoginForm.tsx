import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseService';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAppearance } from '../../contexts/AppearanceContext';
import AuthIllustration from './AuthIllustration';
import ArtLoader from './ArtLoader';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings, loading: appearanceLoading } = useAppearance();

  // Function to clear remembered credentials
  const clearRememberedCredentials = () => {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
  };

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (wasRemembered && rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
      
      // Only autofill password if user previously chose to remember it
      if (rememberedPassword) {
        setPassword(rememberedPassword);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('User logged in:', data.user);
        
        // Handle remember me functionality
        if (rememberMe) {
          // Save email, password and remember me choice to localStorage
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
          localStorage.setItem('rememberMe', 'true');
          
          // Set session to persist for 30 days
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.session?.access_token || '',
            refresh_token: data.session?.refresh_token || ''
          });
          
          if (sessionError) {
            console.error('Error setting persistent session:', sessionError);
          }
        } else {
          // Clear remember me data if unchecked
          clearRememberedCredentials();
        }
        
        onLoginSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
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

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 bg-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              {/* Logo */}
              <div className="flex items-center justify-center mb-4">
                <Link 
                  to="/"
                  className="w-8 h-8 rounded flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer"
                  style={{ 
                    background: `linear-gradient(to bottom right, ${settings.themeColors.pink}, ${settings.themeColors.darkPink})` 
                  }}
                >
                  <span className="text-white font-bold text-sm">A</span>
                </Link>
              </div>

              {/* Welcome Message */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome</h1>
                <p className="text-gray-600 text-sm sm:text-base">Sign in to your account</p>
              </div>

              {/* Login Form */}
              <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
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
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-3 py-3 sm:py-3.5 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm sm:text-base"
                      placeholder="Enter your password"
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

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      setRememberMe(e.target.checked);
                      // Clear stored credentials if unchecked
                      if (!e.target.checked) {
                        clearRememberedCredentials();
                      }
                    }}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                {error && (
                  <div className={`rounded-md p-3 border ${
                    error.includes('Success!') 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className={`h-4 w-4 ${
                          error.includes('Success!') 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`} />
                      </div>
                      <div className="ml-2">
                        <h3 className={`text-sm font-medium ${
                          error.includes('Success!') 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>{error}</h3>
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Links Side by Side */}
              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors text-center sm:text-left"
                >
                  Forgot Password?
                </Link>
                <p className="text-sm text-gray-500 text-center sm:text-right">
                  Not a user?{' '}
                  <Link
                    to="/sign-up"
                    className="font-medium transition-colors"
                    style={{ 
                      color: settings.themeColors.pink,
                      '--tw-text-opacity': '1'
                    } as React.CSSProperties}
                  >
                    Sign up
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

export default LoginForm;