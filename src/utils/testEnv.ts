// Test environment variables loading
export function testEnvironmentVariables() {

  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optionalVars = [
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'VITE_DEV_SERVER_HOST',
    'VITE_DEV_SERVER_PORT',
    'VITE_APP_URL'
  ];
  

  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    const status = value && value !== 'your-project.supabase.co' && value !== 'your-anon-key' ? '✅' : '❌';

  });
  

  optionalVars.forEach(varName => {
    const value = import.meta.env[varName];
    const status = value ? '✅' : '⚠️';

  });
  




  
  // Test Supabase initialization
  try {
    // Import Supabase service dynamically
    import('../services/supabaseService').then(({ getSupabase }) => {
      const supabase = getSupabase();
    }).catch((error) => {
      console.error('❌ Supabase initialization failed:', error);
    });

    return true;
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    return false;
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testEnvironmentVariables();
  }, 1000);
}
