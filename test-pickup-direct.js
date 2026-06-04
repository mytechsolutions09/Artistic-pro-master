// Direct test of Delhivery pickup API through Edge Function
// Run this in browser console on your admin page to test

async function testPickupDirect() {
  console.log('🧪 Testing Delhivery Pickup API directly...');
  
  const testPayload = {
    action: '/pickup_requests',
    method: 'POST',
    endpoint: 'ltl',
    data: {
      client_warehouse: 'YOUR_WAREHOUSE_NAME_HERE', // Replace with actual warehouse name
      pickup_date: '2025-10-25',
      start_time: '10:00:00',
      expected_package_count: 1
    }
  };
  
  console.log('📤 Request payload:', testPayload);
  
  try {
    const response = await fetch('https://varduayfdqivaofymfov.supabase.co/functions/v1/delhivery-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmR1YXlmZHFpdmFvZnltZm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0NjE1ODMsImV4cCI6MjA0NDAzNzU4M30.sqQ1EGshZgGI4lD6CIkWRGZeglQP8_2YvxgUc_ruwlw'
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📄 Response data:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS! Pickup created:', result.data);
    } else {
      console.log('❌ FAILED:', result);
      console.log('📋 Status:', result.status);
      console.log('📋 Status Text:', result.statusText);
      console.log('📋 Data:', result.data);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return { error: error.message };
  }
}

// Instructions:
console.log('📋 INSTRUCTIONS:');
console.log('1. Update the warehouse name in the test above (line 11)');
console.log('2. Run: testPickupDirect()');
console.log('3. Check the output for detailed error information');

