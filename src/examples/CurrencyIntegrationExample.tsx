// Example showing how to integrate the Currency Converter system
// This file demonstrates best practices for using the currency system

import React from 'react';
import { CurrencyProvider, useCurrency } from '../contexts/CurrencyContext';
import CurrencySelector from '../components/CurrencySelector';
import AdminCurrencyDisplay from '../components/admin/AdminCurrencyDisplay';

// Example: Product Price Display with Currency Conversion
const ProductPriceExample: React.FC = () => {
  const { formatCurrency, convertAmount, currentCurrency } = useCurrency();
  
  const originalPrice = 99.99; // USD
  const convertedPrice = convertAmount(originalPrice, 'USD', currentCurrency);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Product: Digital Art Collection</h3>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-green-600">
          {formatCurrency(convertedPrice, currentCurrency)}
        </div>
        
        {currentCurrency !== 'USD' && (
          <div className="text-sm text-gray-500">
            Original: {formatCurrency(originalPrice, 'USD')}
          </div>
        )}
      </div>
    </div>
  );
};

// Example: Order Summary with Multi-Currency Display
const OrderSummaryExample: React.FC = () => {
  const orderItems = [
    { name: 'Abstract Art #1', price: 29.99, currency: 'USD' },
    { name: 'Digital Portrait', price: 45.00, currency: 'USD' },
    { name: 'Nature Collection', price: 19.99, currency: 'USD' }
  ];
  
  const { convertAmount, formatCurrency, currentCurrency } = useCurrency();
  
  const totalUSD = orderItems.reduce((sum, item) => sum + item.price, 0);
  const totalConverted = convertAmount(totalUSD, 'USD', currentCurrency);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-3">
        {orderItems.map((item, index) => {
          const convertedPrice = convertAmount(item.price, item.currency, currentCurrency);
          return (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700">{item.name}</span>
              <span className="font-medium">
                {formatCurrency(convertedPrice, currentCurrency)}
              </span>
            </div>
          );
        })}
        
        <hr className="border-gray-200" />
        
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total:</span>
          <span className="text-green-600">
            {formatCurrency(totalConverted, currentCurrency)}
          </span>
        </div>
        
        {currentCurrency !== 'USD' && (
          <div className="text-sm text-gray-500 text-right">
            USD: {formatCurrency(totalUSD, 'USD')}
          </div>
        )}
      </div>
    </div>
  );
};

// Example: Revenue Dashboard with Currency Display
const RevenueDashboardExample: React.FC = () => {
  const revenueData = {
    daily: 1247.83,
    weekly: 8934.12,
    monthly: 34567.89,
    currency: 'USD'
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Revenue Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Daily Revenue</div>
          <AdminCurrencyDisplay 
            amount={revenueData.daily} 
            fromCurrency={revenueData.currency}
            className="justify-center"
          />
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Weekly Revenue</div>
          <AdminCurrencyDisplay 
            amount={revenueData.weekly} 
            fromCurrency={revenueData.currency}
            className="justify-center"
          />
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Monthly Revenue</div>
          <AdminCurrencyDisplay 
            amount={revenueData.monthly} 
            fromCurrency={revenueData.currency}
            showConversions={true}
            className="justify-center"
          />
        </div>
      </div>
    </div>
  );
};

// Example: Currency Selector Variants
const CurrencySelectorExamples: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Currency Selector Variants</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Default Variant</h4>
          <CurrencySelector showFlag={true} showName={false} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Compact Variant</h4>
          <CurrencySelector variant="compact" showFlag={true} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Full Details</h4>
          <CurrencySelector showFlag={true} showName={true} />
        </div>
      </div>
    </div>
  );
};

// Main example component demonstrating integration
const CurrencyIntegrationExample: React.FC = () => {
  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Currency Converter Integration Examples
            </h1>
            <p className="text-gray-600">
              Demonstrating currency conversion throughout the application
            </p>
          </div>
          
          {/* Currency Selector in Header */}
          <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">Currency Examples</h2>
            <CurrencySelector variant="default" showFlag={true} />
          </div>
          
          {/* Examples Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductPriceExample />
            <OrderSummaryExample />
            <RevenueDashboardExample />
            <CurrencySelectorExamples />
          </div>
          
          {/* Integration Notes */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Integration Notes
            </h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>• Wrap your app with &lt;CurrencyProvider&gt; to enable currency context</p>
              <p>• Use useCurrency() hook to access currency functions in components</p>
              <p>• AdminCurrencyDisplay provides multi-currency display for admin pages</p>
              <p>• CurrencySelector offers flexible currency switching UI</p>
              <p>• All conversions use live exchange rates with intelligent caching</p>
              <p>• Settings page provides complete currency management interface</p>
            </div>
          </div>
          
          {/* API Integration Status */}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-medium">Currency System Active</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Live exchange rates, auto-updates, and full currency management available
            </p>
          </div>
        </div>
      </div>
    </CurrencyProvider>
  );
};

export default CurrencyIntegrationExample;
