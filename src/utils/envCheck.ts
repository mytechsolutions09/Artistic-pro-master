// Environment variable checker (Next.js-safe; no import.meta usage)
export function checkEnvironmentVariables() {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error('Please check your .env file');
    return false;
  }

  return true;
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// Get environment variable with fallback (supports legacy VITE names)
export function getEnvVar(key: string, fallback: string = '') {
  const fromProcess = (process.env as Record<string, string | undefined>)[key];
  if (fromProcess !== undefined && fromProcess !== '') return fromProcess;

  // Backward-compat mapping for legacy callers
  const legacyMap: Record<string, string> = {
    VITE_DEV_SERVER_HOST: 'NEXT_PUBLIC_DEV_SERVER_HOST',
    VITE_DEV_SERVER_PORT: 'NEXT_PUBLIC_DEV_SERVER_PORT',
    VITE_APP_URL: 'NEXT_PUBLIC_APP_URL',
    VITE_API_URL: 'NEXT_PUBLIC_API_URL',
    VITE_ADMIN_URL: 'NEXT_PUBLIC_ADMIN_URL',
    VITE_SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
    VITE_SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  };

  const mapped = legacyMap[key];
  if (mapped) {
    const mappedVal = (process.env as Record<string, string | undefined>)[mapped];
    if (mappedVal !== undefined && mappedVal !== '') return mappedVal;
  }

  return fallback;
}

export function getLocalhostConfig() {
  return {
    host: getEnvVar('NEXT_PUBLIC_DEV_SERVER_HOST', 'localhost'),
    port: parseInt(getEnvVar('NEXT_PUBLIC_DEV_SERVER_PORT', '3000')),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),
    adminUrl: getEnvVar('NEXT_PUBLIC_ADMIN_URL', 'http://localhost:3000/admin'),
  };
}

export function isLocalhost() {
  if (typeof window === 'undefined') return false;
  return isDevelopment() && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
}



