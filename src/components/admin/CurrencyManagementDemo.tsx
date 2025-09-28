import React, { useState } from 'react';
import { 
  Power, PowerOff, Crown, Star, AlertTriangle, CheckCircle, 
  XCircle, RefreshCw, DollarSign, Globe
} from 'lucide-react';
import CurrencyService from '../../services/currencyService';

const CurrencyManagementDemo: React.FC = () => {
  const [currencies, setCurrencies] = useState(CurrencyService.getAllCurrencies());
  const [settings, setSettings] = useState(CurrencyService.getCurrencySettings());
  const [stats, setStats] = useState(CurrencyService.getCurrencyStats());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reload all currency data
  const reloadData = () => {
    setCurrencies(CurrencyService.getAllCurrencies());
    setSettings(CurrencyService.getCurrencySettings());
    setStats(CurrencyService.getCurrencyStats());
  };

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle currency activation/deactivation
  const handleToggleActivation = (currencyCode: string) => {
    const result = CurrencyService.toggleCurrencyActivation(currencyCode);
    showMessage(result.success ? 'success' : 'error', result.message);
    if (result.success) reloadData();
  };

  // Handle default currency change
  const handleSetDefault = (currencyCode: string) => {
    const result = CurrencyService.updateDefaultCurrency(currencyCode);
    showMessage(result.success ? 'success' : 'error', result.message);
    if (result.success) reloadData();
  };

  // Handle auto-update toggle
  const handleToggleAutoUpdate = () => {
    const result = CurrencyService.toggleAutoUpdate(!settings.autoUpdate);
    showMessage(result.success ? 'success' : 'error', result.message);
    if (result.success) reloadData();
  };

  // Update exchange rates
  const handleUpdateRates = async () => {
    const success = await CurrencyService.fetchExchangeRates();
    showMessage(success ? 'success' : 'error', 
      success ? 'Exchange rates updated successfully!' : 'Failed to update exchange rates');
    if (success) reloadData();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Currency Management System Demo
        </h1>
        <p className="text-gray-600">
          Test currency activation, deactivation, and default currency functions
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600">Total Currencies</p>
              <p className="text-2xl font-bold text-blue-800">{stats.totalSupported}</p>
            </div>
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-800">{stats.enabled}</p>
            </div>
            <Power className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600">Inactive</p>
              <p className="text-2xl font-bold text-red-800">{stats.disabled}</p>
            </div>
            <PowerOff className="w-6 h-6 text-red-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600">Default</p>
              <p className="text-lg font-bold text-purple-800">{settings.defaultCurrency}</p>
            </div>
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600">Auto-Update</p>
              <p className="text-sm font-bold text-yellow-800">
                {settings.autoUpdate ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button 
              onClick={handleToggleAutoUpdate}
              className="p-1 rounded hover:bg-yellow-200 transition-colors"
            >
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Currency Control Panel</h2>
          <button
            onClick={handleUpdateRates}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Rates</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency) => {
            const details = CurrencyService.getCurrencyDetails(currency.code);
            const canDeactivate = CurrencyService.canDeactivateCurrency(currency.code);
            
            return (
              <div
                key={currency.code}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currency.code === settings.defaultCurrency
                    ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200'
                    : currency.enabled
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* Currency Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{currency.flag}</span>
                    <div>
                      <div className="font-semibold text-lg flex items-center space-x-2">
                        <span>{currency.code}</span>
                        {details?.isDefault && <Crown className="w-4 h-4 text-purple-600" />}
                        {details?.isBase && <Star className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="text-sm text-gray-500">{currency.name}</div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currency.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {currency.enabled ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>

                {/* Currency Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Symbol:</span>
                    <span className="font-semibold text-lg">{currency.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rate:</span>
                    <span className="font-medium">{currency.rate.toFixed(4)}</span>
                  </div>
                  {currency.code !== 'USD' && (
                    <div className="text-xs text-gray-500">
                      1 USD = {currency.rate.toFixed(4)} {currency.code}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Activation Toggle */}
                  <button
                    onClick={() => handleToggleActivation(currency.code)}
                    disabled={currency.enabled && !canDeactivate}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-medium transition-colors ${
                      currency.enabled
                        ? canDeactivate
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={currency.enabled && !canDeactivate ? 'Cannot deactivate (protected currency)' : ''}
                  >
                    {currency.enabled ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        <span>{canDeactivate ? 'Deactivate' : 'Protected'}</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>

                  {/* Set Default Button */}
                  {currency.enabled && currency.code !== settings.defaultCurrency && (
                    <button
                      onClick={() => handleSetDefault(currency.code)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Set as Default</span>
                    </button>
                  )}

                  {/* Default Currency Badge */}
                  {currency.code === settings.defaultCurrency && (
                    <div className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-purple-200 text-purple-800 rounded-lg font-medium">
                      <Crown className="w-4 h-4" />
                      <span>Current Default</span>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {currency.enabled && !canDeactivate && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-yellow-800">
                        {currency.code === settings.defaultCurrency && 'Default currency'}
                        {currency.code === settings.baseCurrency && 'Base currency'}
                        {settings.enabled <= 1 && 'Last active currency'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Function Test Results */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Available Currency Management Functions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Activation Functions:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <code>CurrencyService.activateCurrency(code)</code></li>
              <li>• <code>CurrencyService.deactivateCurrency(code)</code></li>
              <li>• <code>CurrencyService.toggleCurrencyActivation(code)</code></li>
              <li>• <code>CurrencyService.canDeactivateCurrency(code)</code></li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Default Currency Functions:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <code>CurrencyService.updateDefaultCurrency(code)</code></li>
              <li>• <code>CurrencyService.getAvailableDefaultCurrencies()</code></li>
              <li>• <code>CurrencyService.getCurrencyDetails(code)</code></li>
              <li>• <code>CurrencyService.toggleAutoUpdate(enabled)</code></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Validation Rules:</strong> Default and base currencies cannot be deactivated. 
            At least one currency must remain active. All functions return success/error status with descriptive messages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyManagementDemo;
