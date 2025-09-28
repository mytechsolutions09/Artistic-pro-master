// Test script to verify order creation works after RLS policy fix
// Run this in your browser console after applying the RLS policy fix

async function testOrderCreation() {
  console.log('🧪 Testing order creation...');
  
  try {
    // Import the complete order service (you'll need to adjust the import path)
    const { CompleteOrderService } = await import('./src/services/completeOrderService.ts');
    
    // Test data for guest checkout
    const testOrderData = {
      customerId: null, // Guest order
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      items: [{
        productId: 'test-product-1',
        productTitle: 'Test Product',
        productImage: 'https://example.com/image.jpg',
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99
      }],
      totalAmount: 29.99,
      paymentMethod: 'card',
      paymentId: 'test_payment_123',
      notes: 'Test order',
      shippingAddress: '123 Test St, Test City, TC 12345'
    };
    
    console.log('📝 Test order data:', testOrderData);
    
    // Attempt to create the order
    const result = await CompleteOrderService.completeOrder(testOrderData);
    
    if (result.success) {
      console.log('✅ Order creation test PASSED!');
      console.log('📋 Order ID:', result.orderId);
      console.log('📧 Email sent:', result.emailSent);
      console.log('🔗 Download links:', result.downloadLinks);
    } else {
      console.log('❌ Order creation test FAILED!');
      console.log('🚨 Error:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Test failed with exception:', error);
    console.log('🔍 Error details:', error.message);
  }
}

// Run the test
testOrderCreation();
