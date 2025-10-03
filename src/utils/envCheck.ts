// Environment variable checker
export function checkEnvironmentVariables() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const developmentVars = [
    'VITE_DEV_SERVER_HOST',
    'VITE_DEV_SERVER_PORT',
    'VITE_APP_URL'
  ];
  
  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please check your .env file');
    return false;
  }
  



  
  // Check development variables
  if (import.meta.env.DEV) {




  }
  
  return true;
}

// Check if we're in development mode
export function isDevelopment() {
  return import.meta.env.DEV;
}

// Get environment variable with fallback
export function getEnvVar(key: string, fallback: string = '') {
  return import.meta.env[key] || fallback;
}

// Get localhost configuration
export function getLocalhostConfig() {
  return {
    host: getEnvVar('VITE_DEV_SERVER_HOST', 'localhost'),
    port: parseInt(getEnvVar('VITE_DEV_SERVER_PORT', '5173')),
    url: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
    apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:5173/api'),
    adminUrl: getEnvVar('VITE_ADMIN_URL', 'http://localhost:5173/admin')
  };
}

// Check if running on localhost
export function isLocalhost() {
  return import.meta.env.DEV && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
}
