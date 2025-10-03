import React, { useState } from 'react';
import { Save, Shield, CreditCard, Banknote, Percent, AlertTriangle } from 'lucide-react';

const PaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    commissionRate: '15',
    minimumPayout: '50',
    payoutSchedule: 'weekly',
    paymentMethods: {
      stripe: true,
      paypal: true,
      bankTransfer: false,
      cryptocurrency: false
    },
    stripeSettings: {
      publicKey: '',
      webhookSecret: '',
      testMode: true
    },
    paypalSettings: {
      clientId: '',
      clientSecret: '',
      testMode: true
    },
    taxSettings: {
      enableTax: false,
      defaultTaxRate: '0',
      taxIncluded: false
    }
  });

  const handleSave = () => {

    // Add save logic here
  };

  return (
    <div className="space-y-6">
      {/* Commission & Fees */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Percent className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-800">Commission & Fees</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
            <input
              type="number"
              value={settings.commissionRate}
              onChange={(e) => setSettings({ 
                ...settings, 
                commissionRate: e.target.value 
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              min="0"
              max="50"
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Platform commission on sales</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout ($)</label>
            <input
              type="number"
              value={settings.minimumPayout}
              onChange={(e) => setSettings({ 
                ...settings, 
                minimumPayout: e.target.value 
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              min="0"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum amount for artist payouts</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
            <select
              value={settings.payoutSchedule}
              onChange={(e) => setSettings({ 
                ...settings, 
                payoutSchedule: e.target.value 
              })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How often to process payouts</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Payment Methods</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Stripe</h3>
                  <p className="text-sm text-gray-500">Credit/Debit cards</p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.stripe}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentMethods: {
                      ...settings.paymentMethods,
                      stripe: e.target.checked
                    }
                  })}
                  className="sr-only"
                />
                <div className={`relative w-10 h-6 rounded-full transition-colors ${
                  settings.paymentMethods.stripe ? 'bg-pink-500' : 'bg-gray-200'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.paymentMethods.stripe ? 'translate-x-4' : ''
                  }`} />
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">PayPal</h3>
                  <p className="text-sm text-gray-500">PayPal payments</p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.paypal}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentMethods: {
                      ...settings.paymentMethods,
                      paypal: e.target.checked
                    }
                  })}
                  className="sr-only"
                />
                <div className={`relative w-10 h-6 rounded-full transition-colors ${
                  settings.paymentMethods.paypal ? 'bg-pink-500' : 'bg-gray-200'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.paymentMethods.paypal ? 'translate-x-4' : ''
                  }`} />
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg opacity-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Bank Transfer</h3>
                  <p className="text-sm text-gray-500">Direct bank transfers</p>
                  <span className="text-xs text-blue-600">Coming Soon</span>
                </div>
              </div>
              <div className="w-10 h-6 bg-gray-200 rounded-full">
                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Payment Processing</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Secure payment processing with industry standards</li>
                <li>• Automatic fraud detection and prevention</li>
                <li>• Real-time transaction monitoring</li>
                <li>• PCI DSS compliant infrastructure</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 text-sm">Test Mode Active</h4>
                  <p className="text-yellow-700 text-xs mt-1">
                    Payment gateways are in test mode. No real transactions will be processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Configuration */}
      {settings.paymentMethods.stripe && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Stripe Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
              <input
                type="text"
                value={settings.stripeSettings.publicKey}
                onChange={(e) => setSettings({
                  ...settings,
                  stripeSettings: {
                    ...settings.stripeSettings,
                    publicKey: e.target.value
                  }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="pk_test_..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
              <input
                type="password"
                value={settings.stripeSettings.webhookSecret}
                onChange={(e) => setSettings({
                  ...settings,
                  stripeSettings: {
                    ...settings.stripeSettings,
                    webhookSecret: e.target.value
                  }
                })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="whsec_..."
              />
            </div>
            
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Test Mode</h3>
                  <p className="text-sm text-gray-500">Use Stripe test environment</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.stripeSettings.testMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      stripeSettings: {
                        ...settings.stripeSettings,
                        testMode: e.target.checked
                      }
                    })}
                    className="sr-only"
                  />
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${
                    settings.stripeSettings.testMode ? 'bg-pink-500' : 'bg-gray-200'
                  }`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.stripeSettings.testMode ? 'translate-x-4' : ''
                    }`} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Settings */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Percent className="w-6 h-6 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">Tax Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Enable Tax Calculation</h3>
              <p className="text-sm text-gray-500">Automatically calculate taxes on purchases</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.taxSettings.enableTax}
                onChange={(e) => setSettings({
                  ...settings,
                  taxSettings: {
                    ...settings.taxSettings,
                    enableTax: e.target.checked
                  }
                })}
                className="sr-only"
              />
              <div className={`relative w-10 h-6 rounded-full transition-colors ${
                settings.taxSettings.enableTax ? 'bg-pink-500' : 'bg-gray-200'
              }`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.taxSettings.enableTax ? 'translate-x-4' : ''
                }`} />
              </div>
            </label>
          </div>
          
          {settings.taxSettings.enableTax && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxSettings.defaultTaxRate}
                  onChange={(e) => setSettings({
                    ...settings,
                    taxSettings: {
                      ...settings.taxSettings,
                      defaultTaxRate: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Tax Included in Prices</h3>
                  <p className="text-sm text-gray-500">Prices include tax amount</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.taxSettings.taxIncluded}
                    onChange={(e) => setSettings({
                      ...settings,
                      taxSettings: {
                        ...settings.taxSettings,
                        taxIncluded: e.target.checked
                      }
                    })}
                    className="sr-only"
                  />
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${
                    settings.taxSettings.taxIncluded ? 'bg-pink-500' : 'bg-gray-200'
                  }`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.taxSettings.taxIncluded ? 'translate-x-4' : ''
                    }`} />
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          <Save className="w-5 h-5" />
          <span>Save Payment Settings</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentSettings;
