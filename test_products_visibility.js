// Test script to debug products visibility issue
// Run this in your browser console on the admin products page

console.log('🔍 Testing Products Visibility...');

// 1. Check if ProductContext is working
try {
  const productsContext = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?.getCurrentFiber()?.return?.return?.memoizedState?.element?.props?.value;
  console.log('📦 ProductContext found:', productsContext);
} catch (e) {
  console.log('❌ Could not access ProductContext directly');
}

// 2. Check localStorage for any cached data
console.log('💾 LocalStorage products:', localStorage.getItem('products'));
console.log('💾 LocalStorage adminProducts:', localStorage.getItem('adminProducts'));

// 3. Check if there are any React components with product data
const productElements = document.querySelectorAll('[data-testid*="product"], [class*="product"]');
console.log('🏷️ Product elements found:', productElements.length);

// 4. Check for any hidden products
const hiddenElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], [hidden]');
console.log('👻 Hidden elements:', hiddenElements.length);

// 5. Check if products are in the DOM but not visible
const productRows = document.querySelectorAll('tr, [role="row"]');
console.log('📋 Table rows found:', productRows.length);

// 6. Look for any error messages
const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"], [class*="warning"]');
console.log('⚠️ Error/warning elements:', errorElements.length);

// 7. Check network requests
console.log('🌐 Check Network tab for any failed requests to /products');

// 8. Test database connection
async function testDatabaseConnection() {
  try {
    // This will only work if you have access to the supabase client
    if (window.supabase) {
      const { data, error } = await window.supabase
        .from('products')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Database error:', error);
      } else {
        console.log('✅ Database connection successful:', data);
      }
    } else {
      console.log('ℹ️ Supabase client not accessible from console');
    }
  } catch (e) {
    console.log('❌ Database test failed:', e);
  }
}

// Run the test
testDatabaseConnection();

console.log('🔍 Products visibility test completed. Check the output above for clues.');
