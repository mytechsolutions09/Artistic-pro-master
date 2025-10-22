import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Mail,
  Phone,
  MapPin,
  Loader2,
  Trash2,
  Lock,
  Wallet
} from 'lucide-react';
import { CartManager } from '../services/orderService';
import { CompleteOrderService, CompleteOrderData } from '../services/completeOrderService';
import { createOrderBypassRLS, isServiceRoleAvailable } from '../services/orderServiceBypass';
import razorpayService from '../services/razorpayService';
import StoreCreditService from '../services/storeCreditService';
import { Cart, Product } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import SavedAddressDropdown from '../components/SavedAddressDropdown';
import { AddressFormData } from '../services/addressService';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { formatUIPrice } = useCurrency();
  const { user } = useAuth();
  const { allProducts, getProductById } = useProducts();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'India',
    sameAsShipping: true
  });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'store_credit'>('razorpay');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storeCreditBalance, setStoreCreditBalance] = useState<number>(0);
  const [useStoreCredit, setUseStoreCredit] = useState<boolean>(false);
  const [storeCreditToUse, setStoreCreditToUse] = useState<number>(0);
  
  // Check if it's a direct purchase
  const productId = searchParams.get('product');
  const productType = searchParams.get('type') || 'digital';
  const productPrice = searchParams.get('price');
  const posterSize = searchParams.get('size');
  const [directPurchaseProduct, setDirectPurchaseProduct] = useState<Product | null>(null);
  
  // Check if cart has physical products (for COD eligibility)
  const hasPhysicalProducts = cart.items.some(item => 
    item.selectedProductType === 'poster' || item.selectedProductType === 'clothing'
  );

  // Calculate remaining amount after store credit
  const remainingAmount = Math.max(0, cart.total - storeCreditToUse);
  
  // Fetch store credit balance
  useEffect(() => {
    const fetchStoreCreditBalance = async () => {
      if (user?.id) {
        const balance = await StoreCreditService.getUserBalance(user.id);
        setStoreCreditBalance(balance);
      }
    };
    fetchStoreCreditBalance();
  }, [user]);

  // Calculate store credit to use
  useEffect(() => {
    if (useStoreCredit && storeCreditBalance > 0) {
      const maxCredit = Math.min(storeCreditBalance, cart.total);
      setStoreCreditToUse(maxCredit);
      
      // If store credit covers full amount, switch to store_credit payment
      if (maxCredit >= cart.total) {
        setPaymentMethod('store_credit');
      }
    } else {
      setStoreCreditToUse(0);
      if (paymentMethod === 'store_credit') {
        setPaymentMethod('razorpay');
      }
    }
  }, [useStoreCredit, storeCreditBalance, cart.total]);

  // Reset payment method to Razorpay if COD is selected but no physical products
  useEffect(() => {
    if (!hasPhysicalProducts && paymentMethod === 'cod') {
      setPaymentMethod('razorpay');
    }
  }, [hasPhysicalProducts, paymentMethod]);
  
  useEffect(() => {
    if (productId) {
      // Wait for products to load
      if (allProducts.length === 0) {
        // Waiting for products to load
        return;
      }

      // Fetch real product data from ProductContext
      const realProduct = getProductById(productId);
      if (realProduct) {
        setDirectPurchaseProduct(realProduct);
        
        // Use the price from URL parameters if available, otherwise use product price
        const finalPrice = productPrice ? parseFloat(productPrice) : realProduct.price;
        
        setCart({ 
          items: [{ 
            id: '1', 
            product: realProduct, 
            quantity: 1,
            selectedProductType: productType as 'digital' | 'poster',
            selectedPosterSize: posterSize || undefined,
            selectedPrice: finalPrice
          }], 
          total: finalPrice 
        });
      } else {
        // If product not found after products loaded, redirect back
        console.error('Product not found:', productId);
        alert('Product not found. Redirecting to browse page...');
        navigate('/browse');
      }
    } else {
      // Load cart from CartManager
      setCart(CartManager.getCart());
      
      // Subscribe to cart changes
      const unsubscribe = CartManager.subscribe(setCart);
      return unsubscribe;
    }
  }, [productId, productType, productPrice, posterSize, getProductById, navigate, allProducts]);

  // Autofill user information when logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
        lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        phone: user.user_metadata?.phone || user.user_metadata?.phone_number || ''
      }));
    }
  }, [user]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Shipping address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'PIN code is required';
    
    // Validate billing address if different from shipping
    if (!formData.sameAsShipping) {
      if (!formData.billingAddress) newErrors.billingAddress = 'Billing address is required';
      if (!formData.billingCity) newErrors.billingCity = 'Billing city is required';
      if (!formData.billingState) newErrors.billingState = 'Billing state is required';
      if (!formData.billingZipCode) newErrors.billingZipCode = 'Billing PIN code is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectAddress = (addressData: AddressFormData) => {
    setFormData(prev => ({
      ...prev,
      email: addressData.email,
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      phone: addressData.phone,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country
    }));
  };

  const handleSaveAddress = async (addressData: AddressFormData) => {
    if (!user?.id) return;

    try {
      const { default: AddressService } = await import('../services/addressService');
      const result = await AddressService.saveAddress(user.id, addressData, true); // Save as default
      
      if (result.success) {
        // Address saved successfully
      } else {
        console.error('Failed to save address:', result.error);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (cart.items.length === 0) return;
    
    setLoading(true);
    
    try {
      // Generate temporary order ID
      const tempOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare order data
      const orderData: CompleteOrderData = {
        customerId: user?.id || null,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: cart.items.map(item => ({
          productId: item.product.id,
          productTitle: item.product.title,
          productImage: item.product.images?.[0],
          quantity: item.quantity,
          unitPrice: item.selectedPrice,
          totalPrice: item.selectedPrice * item.quantity,
          selectedProductType: item.selectedProductType,
          selectedPosterSize: item.selectedPosterSize,
          options: item.options
        })),
        totalAmount: cart.total,
        paymentMethod: paymentMethod,
        paymentId: paymentMethod === 'cod' ? 'COD-PENDING' : '', // Will be set after payment for Razorpay
        notes: paymentMethod === 'cod' ? 'Cash on Delivery - Payment pending upon delivery' : undefined,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
        billingAddress: formData.sameAsShipping 
          ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`
          : `${formData.billingAddress}, ${formData.billingCity}, ${formData.billingState} ${formData.billingZipCode}, ${formData.billingCountry}`
      };

      // Handle Store Credit-only orders
      if (paymentMethod === 'store_credit' && user?.id) {
        // Deduct store credit
        const creditResult = await StoreCreditService.deductCredit(
          user.id,
          cart.total,
          `Payment for order (Store Credit)`,
          tempOrderId
        );

        if (!creditResult.success) {
          throw new Error(creditResult.error || 'Failed to process store credit payment');
        }

        // Update order data
        orderData.paymentId = `CREDIT_${tempOrderId}`;
        orderData.paymentMethod = 'store_credit';
        orderData.notes = `Paid with Store Credit: ₹${cart.total.toFixed(2)}`;

        // Complete the order
        let result = await CompleteOrderService.completeOrder(orderData);
        
        // If normal order fails with RLS error, try bypass method
        if (!result.success && result.error?.includes('row-level security policy')) {
          if (isServiceRoleAvailable()) {
            result = await createOrderBypassRLS(orderData);
          } else {
            throw new Error('RLS policy error and service role not available.');
          }
        }
        
        if (result.success && result.orderId) {
          // Clear cart if not direct purchase
          if (!productId) {
            CartManager.clearCart();
          }
          
          // Redirect to success page
          navigate(`/payment-success?orderId=${result.orderId}&paymentMethod=store_credit&creditUsed=${cart.total}`);
        } else {
          throw new Error(result.error || 'Order placement failed');
        }
        return;
      }

      // Handle COD orders separately
      if (paymentMethod === 'cod') {
        // Complete the order directly without payment gateway
        let result = await CompleteOrderService.completeOrder(orderData);
        
        // If normal order fails with RLS error, try bypass method
        if (!result.success && result.error?.includes('row-level security policy')) {
          if (isServiceRoleAvailable()) {
            result = await createOrderBypassRLS(orderData);
          } else {
            throw new Error('RLS policy error and service role not available.');
          }
        }
        
        if (result.success && result.orderId) {
          // Clear cart if not direct purchase
          if (!productId) {
            CartManager.clearCart();
          }
          
          // Redirect to success page with COD message
          navigate(`/payment-success?orderId=${result.orderId}&paymentMethod=cod`);
        } else {
          throw new Error(result.error || 'Order placement failed');
        }
        return;
      }

      // Initiate Razorpay payment for online payment
      // Use remaining amount if store credit is applied
      const amountToPay = useStoreCredit && storeCreditToUse > 0 ? remainingAmount : cart.total;
      
      await razorpayService.initiatePayment(
        {
          orderId: tempOrderId,
          amount: amountToPay,
          currency: 'INR',
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerEmail: formData.email,
          customerPhone: formData.phone || '+919999999999', // Use actual phone if available
          customerId: user?.id || 'guest',
          description: `Order for ${cart.items.length} item(s)${useStoreCredit && storeCreditToUse > 0 ? ' (Partial Store Credit Applied)' : ''}`
        },
        // Success callback
        async (response) => {
          try {
            // If store credit was used, deduct it
            if (useStoreCredit && storeCreditToUse > 0 && user?.id) {
              const creditResult = await StoreCreditService.deductCredit(
                user.id,
                storeCreditToUse,
                `Partial payment for order (Store Credit + Razorpay)`,
                tempOrderId
              );

              if (!creditResult.success) {
                console.error('Failed to deduct store credit:', creditResult.error);
                // Continue with order anyway as Razorpay payment succeeded
              }

              // Update order notes to reflect both payment methods
              orderData.notes = `Paid: ₹${amountToPay.toFixed(2)} via Razorpay + ₹${storeCreditToUse.toFixed(2)} Store Credit`;
            }

            // Update order data with payment ID
            orderData.paymentId = response.razorpay_payment_id;
            
            // Complete the order
            let result = await CompleteOrderService.completeOrder(orderData);
            
            // If normal order fails with RLS error, try bypass method
            if (!result.success && result.error?.includes('row-level security policy')) {
              if (isServiceRoleAvailable()) {
                result = await createOrderBypassRLS(orderData);
              } else {
                throw new Error('RLS policy error and service role not available.');
              }
            }
            
            if (result.success && result.orderId) {
              // Clear cart if not direct purchase
              if (!productId) {
                CartManager.clearCart();
              }
              
              // Redirect to success page
              navigate(`/payment-success?orderId=${result.orderId}&paymentId=${response.razorpay_payment_id}`);
            } else {
              throw new Error(result.error || 'Order completion failed');
            }
          } catch (error) {
            console.error('Order completion failed:', error);
            navigate(`/payment-failed?error=${encodeURIComponent((error as Error).message)}&amount=${cart.total}`);
          }
        },
        // Failure callback
        (error) => {
          console.error('Payment failed:', error);
          setLoading(false);
          navigate(`/payment-failed?error=${encodeURIComponent(error.message || 'Payment failed')}&amount=${cart.total}`);
        }
      );
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setLoading(false);
      navigate(`/payment-failed?error=${encodeURIComponent((error as Error).message)}&amount=${cart.total}`);
    }
  };
  
  const removeItem = (productId: string) => {
    CartManager.removeItem(productId);
  };
  

  
  // Show loading state if waiting for products to load for direct purchase
  if (productId && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Loader2 className="w-16 h-16 text-teal-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Product...</h1>
          <p className="text-gray-600">Please wait while we fetch the product details.</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0 && !directPurchaseProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some amazing artworks to your cart before checking out.</p>
          <button 
            onClick={() => navigate('/browse')}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 text-blue-500 mr-2" />
                  Customer Information
                </h2>
                
                <div className="space-y-4">
                  {/* Saved Addresses Dropdown */}
                  {user && (
                    <SavedAddressDropdown
                      onSelectAddress={handleSelectAddress}
                      onSaveNewAddress={handleSaveAddress}
                      currentFormData={{
                        email: formData.email,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                        country: formData.country
                      }}
                      userId={user.id}
                    />
                  )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                            errors.email ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                          }`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                            errors.phone ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                          }`}
                          placeholder="+91 99999 99999"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                          errors.firstName ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        placeholder="John"
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                          errors.lastName ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 text-green-500 mr-1" />
                      Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                            errors.address ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                          }`}
                          placeholder="123 Main Street, Apartment 4B"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                              errors.city ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Mumbai"
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                              errors.state ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Maharashtra"
                          />
                          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                              errors.zipCode ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                            }`}
                            placeholder="400001"
                          />
                          {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            sameAsShipping: e.target.checked,
                            billingAddress: e.target.checked ? prev.address : prev.billingAddress,
                            billingCity: e.target.checked ? prev.city : prev.billingCity,
                            billingState: e.target.checked ? prev.state : prev.billingState,
                            billingZipCode: e.target.checked ? prev.zipCode : prev.billingZipCode,
                            billingCountry: e.target.checked ? prev.country : prev.billingCountry
                          }));
                        }}
                        className="mr-2"
                      />
                      <label htmlFor="sameAsShipping" className="text-sm font-medium text-gray-700">
                        Billing address same as shipping address
                      </label>
                    </div>
                    
                    {!formData.sameAsShipping && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          <MapPin className="w-4 h-4 text-orange-500 mr-1" />
                          Billing Address
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                              type="text"
                              name="billingAddress"
                              value={formData.billingAddress}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                                errors.billingAddress ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                              }`}
                              placeholder="123 Main Street, Apartment 4B"
                            />
                            {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                              <input
                                type="text"
                                name="billingCity"
                                value={formData.billingCity}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                                  errors.billingCity ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                                }`}
                                placeholder="Mumbai"
                              />
                              {errors.billingCity && <p className="text-red-500 text-xs mt-1">{errors.billingCity}</p>}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                              <input
                                type="text"
                                name="billingState"
                                value={formData.billingState}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                                  errors.billingState ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                                }`}
                                placeholder="Maharashtra"
                              />
                              {errors.billingState && <p className="text-red-500 text-xs mt-1">{errors.billingState}</p>}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                              <input
                                type="text"
                                name="billingZipCode"
                                value={formData.billingZipCode}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm ${
                                  errors.billingZipCode ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'
                                }`}
                                placeholder="400001"
                              />
                              {errors.billingZipCode && <p className="text-red-500 text-xs mt-1">{errors.billingZipCode}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Credit Section */}
              {user && storeCreditBalance > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg border border-purple-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <Wallet className="w-5 h-5 text-purple-500 mr-2" />
                      Store Credit Available
                    </h2>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{formatUIPrice(storeCreditBalance, 'INR')}</p>
                      <p className="text-xs text-gray-500">Available Balance</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useStoreCredit}
                        onChange={(e) => setUseStoreCredit(e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Use Store Credit for this order</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {storeCreditBalance >= cart.total 
                            ? `This will cover the full order amount of ${formatUIPrice(cart.total, 'INR')}`
                            : `₹${storeCreditToUse.toFixed(2)} will be applied. Pay remaining ${formatUIPrice(remainingAmount, 'INR')}`
                          }
                        </p>
                      </div>
                    </label>
                    
                    {useStoreCredit && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Store Credit Applied:</span>
                          <span className="font-bold text-purple-600">- {formatUIPrice(storeCreditToUse, 'INR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                          <span className="text-gray-600">Amount to Pay:</span>
                          <span className="font-bold text-gray-800">{formatUIPrice(remainingAmount, 'INR')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              {(!useStoreCredit || remainingAmount > 0) && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Lock className="w-5 h-5 text-purple-500 mr-2" />
                  Payment Method {useStoreCredit && remainingAmount > 0 && <span className="ml-2 text-sm text-gray-500">(for remaining {formatUIPrice(remainingAmount, 'INR')})</span>}
                </h2>
                
                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <label 
                    className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'razorpay' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'razorpay' | 'cod')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">Online Payment (Razorpay)</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Recommended</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay securely using Cards, UPI, Net Banking, or Wallets
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">💳 Cards</span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">📱 UPI</span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">🏦 Net Banking</span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">💰 Wallets</span>
                      </div>
                    </div>
                  </label>

                  {/* COD Option - Only show for physical products and when not fully paid with store credit */}
                  {hasPhysicalProducts && !(useStoreCredit && remainingAmount === 0) ? (
                    <label 
                      className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'cod' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'razorpay' | 'cod')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">Cash on Delivery (COD)</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Physical Items</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay with cash when your order is delivered
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            💵 Pay at doorstep
                          </span>
                        </div>
                      </div>
                    </label>
                  ) : hasPhysicalProducts && useStoreCredit && remainingAmount === 0 ? (
                    <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 opacity-60">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          disabled
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-500">Cash on Delivery (COD)</span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Not Needed</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            COD is not available when paying with store credit. Your order is fully covered by your store credit balance.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 opacity-60">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          disabled
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-500">Cash on Delivery (COD)</span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Not Available</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            COD is only available for physical products (posters). Digital downloads require online payment.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}
              
              
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBag className="w-5 h-5 text-purple-500 mr-2" />
                  Order Summary
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {cart.items.reduce((total, item) => total + item.quantity, 0)} {cart.items.reduce((total, item) => total + item.quantity, 0) === 1 ? 'Item' : 'Items'}
                </span>
              </h3>
              
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <img 
                      src={item.product.images?.[0] || '/api/placeholder/400/400'} 
                      alt={item.product.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate text-xs">{item.product.title}</h4>
                      <p className="text-xs text-gray-500">
                        {item.selectedProductType === 'digital' 
                          ? 'Digital Download' 
                          : item.selectedProductType === 'clothing'
                          ? (() => {
                              const parts = [];
                              if (item.options?.color) parts.push(`Color: ${item.options.color}`);
                              if (item.options?.size) parts.push(`Size: ${item.options.size}`);
                              return parts.length > 0 ? parts.join(', ') : 'Clothing';
                            })()
                          : `Poster Size: ${item.selectedPosterSize || 'Standard'}`
                        }
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {item.product.originalPrice && item.product.originalPrice > item.selectedPrice ? (
                        <div>
                          <p className="text-xs text-gray-400 line-through">{formatUIPrice(item.product.originalPrice, 'INR')}</p>
                          <p className="font-semibold text-gray-800 text-xs">{formatUIPrice(item.selectedPrice, 'INR')}</p>
                          {item.product.discountPercentage && (
                            <p className="text-xs text-green-600 font-medium">{item.product.discountPercentage}% OFF</p>
                          )}
                        </div>
                      ) : (
                        <p className="font-semibold text-gray-800 text-xs">{formatUIPrice(item.selectedPrice, 'INR')}</p>
                      )}
                      {!productId && (
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-500 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  {/* Calculate original total and discount */}
                  {(() => {
                    const originalTotal = cart.items.reduce((sum, item) => {
                      const originalPrice = item.product.originalPrice && item.product.originalPrice > item.selectedPrice 
                        ? item.product.originalPrice 
                        : item.selectedPrice;
                      return sum + (originalPrice * item.quantity);
                    }, 0);
                    const totalDiscount = originalTotal - cart.total;
                    
                    return (
                      <div className="space-y-1">
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Original Price</span>
                            <span>{formatUIPrice(originalTotal, 'INR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>{formatUIPrice(cart.total, 'INR')}</span>
                        </div>
                        {totalDiscount > 0 && (
                          <div className="flex justify-between text-sm text-green-600 font-medium">
                            <span>Discount</span>
                            <span>-{formatUIPrice(totalDiscount, 'INR')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Processing Fee</span>
                          <span>{formatUIPrice(0, 'INR')}</span>
                        </div>
                        {useStoreCredit && storeCreditToUse > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
                              <span>Order Total</span>
                              <span>{formatUIPrice(cart.total, 'INR')}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold text-purple-600">
                              <span className="flex items-center">
                                <Wallet className="w-4 h-4 mr-1" />
                                Store Credit Applied
                              </span>
                              <span>-{formatUIPrice(storeCreditToUse, 'INR')}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t border-gray-200">
                              <span>Amount to Pay</span>
                              <span>{formatUIPrice(remainingAmount, 'INR')}</span>
                            </div>
                          </div>
                        )}
                        {(!useStoreCredit || storeCreditToUse === 0) && (
                          <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>{formatUIPrice(cart.total, 'INR')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Payment Info */}
            {paymentMethod === 'store_credit' ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <Wallet className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Store Credit Payment</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Your order will be processed immediately using your available store credit.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 mt-2">
                      <li>✓ No additional payment required</li>
                      <li>✓ Instant order confirmation</li>
                      <li>✓ Secure and hassle-free</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : paymentMethod === 'razorpay' ? (
              <>
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Secure Payment with Razorpay</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        You'll be redirected to Razorpay's secure payment gateway to complete your purchase.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">
                          Cards
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">
                          UPI
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">
                          Net Banking
                        </span>
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700 border border-gray-200">
                          Wallets
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Payment details will be entered securely on Razorpay's payment page. Your card information is never stored on our servers.
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">💵</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Cash on Delivery</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      You'll pay in cash when your order is delivered to your doorstep.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 mt-2">
                      <li>✓ No advance payment required</li>
                      <li>✓ Pay only when you receive the product</li>
                      <li>✓ Inspect before payment</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                paymentMethod === 'store_credit'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : paymentMethod === 'razorpay'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {paymentMethod === 'store_credit' 
                      ? 'Processing Order...' 
                      : paymentMethod === 'razorpay' 
                      ? 'Opening Payment Gateway...' 
                      : 'Placing Order...'}
                  </span>
                </>
              ) : paymentMethod === 'store_credit' ? (
                <span>Place Order - Pay with Store Credit</span>
              ) : paymentMethod === 'razorpay' ? (
                <span>Pay {formatUIPrice(useStoreCredit && storeCreditToUse > 0 ? remainingAmount : cart.total, 'INR')} - Proceed to Payment</span>
              ) : (
                <span>Place Order - {formatUIPrice(useStoreCredit && storeCreditToUse > 0 ? remainingAmount : cart.total, 'INR')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
