// Test environment variables loading
export function testEnvironmentVariables() {
  console.log('🧪 Testing Environment Variables...');
  
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
  
  console.log('\n📋 Required Variables:');
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    const status = value && value !== 'your-project.supabase.co' && value !== 'your-anon-key' ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : 'Not set'}`);
  });
  
  console.log('\n📋 Optional Variables:');
  optionalVars.forEach(varName => {
    const value = import.meta.env[varName];
    const status = value ? '✅' : '⚠️';
    console.log(`${status} ${varName}: ${value || 'Not set'}`);
  });
  
  console.log('\n🌍 Environment Info:');
  console.log(`Mode: ${import.meta.env.MODE}`);
  console.log(`Development: ${import.meta.env.DEV}`);
  console.log(`Production: ${import.meta.env.PROD}`);
  
  // Test Supabase initialization
  try {
    console.log('\n🔧 Testing Supabase Initialization...');
    const { getSupabase } = require('../services/supabaseService');
    const supabase = getSupabase();
    console.log('✅ Supabase client created successfully');
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
