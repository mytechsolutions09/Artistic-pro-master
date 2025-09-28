import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calculator, ArrowRightLeft, RefreshCw, CheckCircle, XCircle,
  TrendingUp, Clock, Zap, AlertCircle, ToggleLeft, ToggleRight, Power, PowerOff
} from 'lucide-react';
import CurrencyService from '../../../services/currencyService';
import { useCurrency } from '../../../contexts/CurrencyContext';
import CurrencySelector from '../../CurrencySelector';

const CurrencySettings: React.FC = () => {
  // Use currency context to sync with frontend
  const { 
    enabledCurrencies: contextEnabledCurrencies, 
    currencySettings: contextCurrencySettings,
    updateExchangeRates,
    isUpdating,
    activateCurrency,
    deactivateCurrency,
    updateDefaultCurrency: updateDefaultCurrencyContext
  } = useCurrency();
  
  const [currencySettings, setCurrencySettings] = useState(CurrencyService.getCurrencySettings());
  const [currencies, setCurrencies] = useState(CurrencyService.getAllCurrencies());
  const [currencyStats, setCurrencyStats] = useState(CurrencyService.getCurrencyStats());
  const [updatingRates, setUpdatingRates] = useState(false);
  const [lastUpdateStatus, setLastUpdateStatus] = useState<'success' | 'error' | null>(null);

  // Price converter state
  const [converter, setConverter] = useState({
    amount: '100',
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    convertedAmount: 0
  });

  // Load currency data on component mount and sync with context
  useEffect(() => {
    loadCurrencyData();
  }, []);

  // Sync with context changes
  useEffect(() => {
    setCurrencySettings(contextCurrencySettings);
    setCurrencies(CurrencyService.getAllCurrencies());
  }, [contextCurrencySettings, contextEnabledCurrencies]);

  // Calculate converted amount whenever inputs change
  useEffect(() => {
    const amount = parseFloat(converter.amount) || 0;
    const converted = CurrencyService.convertAmount(amount, converter.fromCurrency, converter.toCurrency);
    setConverter(prev => ({ ...prev, convertedAmount: converted }));
  }, [converter.amount, converter.fromCurrency, converter.toCurrency, currencies]);

  const loadCurrencyData = () => {
    setCurrencySettings(CurrencyService.getCurrencySettings());
    setCurrencies(CurrencyService.getAllCurrencies());
    setCurrencyStats(CurrencyService.getCurrencyStats());
  };

  // Update exchange rates from API using context
  const handleUpdateRates = async () => {
    setUpdatingRates(true);
    setLastUpdateStatus(null);
    
    try {
      const success = await updateExchangeRates();
      if (success) {
        setLastUpdateStatus('success');
        loadCurrencyData();
      } else {
        setLastUpdateStatus('error');
      }
    } catch (error) {
      setLastUpdateStatus('error');
    } finally {
      setUpdatingRates(false);
    }
  };

  // Toggle currency activation/deactivation using context
  const handleToggleCurrency = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    let result;
    
    if (currency?.enabled) {
      result = deactivateCurrency(currencyCode);
    } else {
      result = activateCurrency(currencyCode);
    }
    
    if (result.success) {
      setLastUpdateStatus('success');
      loadCurrencyData();
    } else {
      setLastUpdateStatus('error');
      alert(result.message);
    }
    
    // Show success message briefly
    if (result.success) {
      setTimeout(() => setLastUpdateStatus(null), 3000);
    }
  };

  // Update default currency using context
  const handleDefaultCurrencyChange = (currencyCode: string) => {
    const result = updateDefaultCurrencyContext(currencyCode);
    
    if (result.success) {
      setLastUpdateStatus('success');
      loadCurrencyData();
    } else {
      setLastUpdateStatus('error');
      alert(result.message);
    }
    
    // Show success message briefly
    if (result.success) {
      setTimeout(() => setLastUpdateStatus(null), 3000);
    }
  };

  // Toggle auto-update
  const handleToggleAutoUpdate = () => {
    const newAutoUpdate = !currencySettings.autoUpdate;
    const result = CurrencyService.toggleAutoUpdate(newAutoUpdate);
    
    if (result.success) {
      setLastUpdateStatus('success');
      loadCurrencyData();
    } else {
      setLastUpdateStatus('error');
      alert(result.message);
    }
    
    // Show success message briefly
    if (result.success) {
      setTimeout(() => setLastUpdateStatus(null), 3000);
    }
  };

  // Get time since last update
  const getLastUpdateTime = () => {
    const lastUpdate = new Date(currencySettings.lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastUpdate.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Success/Error Notification */}
      {lastUpdateStatus && (
        <div className={`p-4 rounded-lg border-l-4 ${
          lastUpdateStatus === 'success' 
            ? 'bg-green-50 border-green-400 text-green-700' 
            : 'bg-red-50 border-red-400 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {lastUpdateStatus === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">
              {lastUpdateStatus === 'success' 
                ? 'Currency settings updated successfully! Changes are now reflected in the frontend currency selector.' 
                : 'Failed to update currency settings. Please try again.'}
            </span>
          </div>
        </div>
      )}
      {/* Currency Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">Currency Overview</h2>
          </div>
          <button
            onClick={handleUpdateRates}
            disabled={updatingRates || isUpdating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${updatingRates || isUpdating ? 'animate-spin' : ''}`} />
            <span>{updatingRates || isUpdating ? 'Updating...' : 'Update Rates'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Total Currencies</p>
                <p className="text-xl font-bold text-blue-800">{currencyStats.totalSupported}</p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Active</p>
                <p className="text-xl font-bold text-green-800">{currencyStats.enabled}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">Inactive</p>
                <p className="text-xl font-bold text-red-800">{currencyStats.disabled}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Default</p>
                <p className="text-xl font-bold text-purple-800">{currencyStats.defaultCurrency}</p>
              </div>
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600">Last Update</p>
                <p className="text-xs font-bold text-yellow-800">{getLastUpdateTime()}</p>
              </div>
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        {lastUpdateStatus && (
          <div className={`mb-4 p-3 rounded-lg ${lastUpdateStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {lastUpdateStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${lastUpdateStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {lastUpdateStatus === 'success' ? 'Operation completed successfully!' : 'Operation failed. Please try again.'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Currency Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-800">Currency Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <div className="relative">
              <select
                value={currencySettings.defaultCurrency}
                onChange={(e) => handleDefaultCurrencyChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 appearance-none"
              >
                {CurrencyService.getAvailableDefaultCurrencies().map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default currency for new products, pricing, and user interface display
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base Currency</label>
            <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
              {currencyStats.baseCurrency} - Used for calculations
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base currency for exchange rate calculations (cannot be changed)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Update Rates</label>
            <button
              onClick={handleToggleAutoUpdate}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
                currencySettings.autoUpdate 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300'
              }`}
            >
              {currencySettings.autoUpdate ? (
                <><ToggleRight className="w-5 h-5" /><span>Enabled</span></>
              ) : (
                <><ToggleLeft className="w-5 h-5" /><span>Disabled</span></>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Automatically update exchange rates hourly
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <ArrowRightLeft className="w-6 h-6 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">Frontend Currency Selector Preview</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Default Style</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <CurrencySelector showFlag={true} showName={false} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Standard currency selector with flags</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">With Currency Names</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <CurrencySelector showFlag={true} showName={true} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Extended view showing currency names</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Compact Style</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <CurrencySelector variant="compact" showFlag={true} showName={false} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Compact version for smaller spaces</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Live Integration</span>
          </div>
          <p className="text-sm text-blue-800">
            The currency selectors above are connected to your settings. Changes you make to currency activation, 
            default currency, or exchange rates will be immediately reflected in these previews and across the entire frontend.
          </p>
        </div>
      </div>

      {/* Currency Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Currency Management</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {currencySettings.autoUpdate && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>Auto-update enabled</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Manage supported currencies and exchange rates. Users can switch between enabled currencies throughout the platform.
            Toggle currencies on/off and set your default currency for new transactions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((currency) => {
              const details = CurrencyService.getCurrencyDetails(currency.code);
              const canDeactivate = CurrencyService.canDeactivateCurrency(currency.code);
              
              return (
                <div 
                  key={currency.code} 
                  className={`p-4 border rounded-lg transition-all ${
                    currency.code === currencySettings.defaultCurrency
                      ? 'border-pink-300 bg-pink-50 shadow-sm ring-2 ring-pink-200' 
                      : currency.enabled
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{currency.flag}</span>
                      <div>
                        <div className="font-semibold text-sm flex items-center space-x-2">
                          <span>{currency.code}</span>
                          {details?.isBase && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                              BASE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {currency.code === currencySettings.defaultCurrency && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                          DEFAULT
                        </span>
                      )}
                      <div className="flex items-center space-x-2">
                        {!currency.enabled && (
                          <button
                            onClick={() => handleDefaultCurrencyChange(currency.code)}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full font-medium transition-colors"
                            title="Set as default"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleCurrency(currency.code)}
                          disabled={currency.enabled && !canDeactivate}
                          className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                            currency.enabled
                              ? canDeactivate
                                ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                                : 'bg-green-100 text-green-700 opacity-50 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                          }`}
                          title={currency.enabled && !canDeactivate ? 'Cannot deactivate (default/base currency)' : ''}
                        >
                          {currency.enabled ? (
                            <><PowerOff className="w-3 h-3" /><span>Deactivate</span></>
                          ) : (
                            <><Power className="w-3 h-3" /><span>Activate</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg text-gray-800">{currency.symbol}</span>
                      <span className="text-sm font-medium text-gray-600">
                        Rate: {currency.rate.toFixed(4)}
                      </span>
                    </div>
                    
                    {currency.code !== 'USD' && (
                      <div className="text-xs text-gray-500">
                        1 USD = {currency.rate.toFixed(4)} {currency.code}
                      </div>
                    )}
                    
                    {currency.code === 'USD' && (
                      <div className="text-xs text-blue-600 font-medium">Base Currency for Calculations</div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${currency.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {currency.enabled ? 'Active' : 'Inactive'}
                      </span>
                      {currency.enabled && currency.code !== currencySettings.defaultCurrency && (
                        <button
                          onClick={() => handleDefaultCurrencyChange(currency.code)}
                          className="text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                        >
                          Make Default
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Currency Converter Tool */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-800">Currency Converter</h2>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {getLastUpdateTime()}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Convert prices between different currencies using live exchange rates. Perfect for setting international pricing and understanding global market values.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Convert From</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={converter.amount}
                onChange={(e) => setConverter({ ...converter, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg font-semibold"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Currency</label>
              <select
                value={converter.fromCurrency}
                onChange={(e) => setConverter({ ...converter, fromCurrency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                {currencies.filter(c => c.enabled).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setConverter({
                  ...converter,
                  fromCurrency: converter.toCurrency,
                  toCurrency: converter.fromCurrency
                })}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Swap</span>
              </button>
            </div>
          </div>
          
          {/* Output Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Convert To</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Converted Amount</label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-lg font-bold text-green-600">
                {CurrencyService.formatCurrency(converter.convertedAmount, converter.toCurrency)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Currency</label>
              <select
                value={converter.toCurrency}
                onChange={(e) => setConverter({ ...converter, toCurrency: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                {currencies.filter(c => c.enabled).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Exchange Rate Info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <div className="font-semibold text-blue-800 mb-1">Exchange Rate</div>
                <div className="text-blue-700">
                  1 {converter.fromCurrency} = {
                    CurrencyService.convertAmount(1, converter.fromCurrency, converter.toCurrency).toFixed(4)
                  } {converter.toCurrency}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  ✓ Using live exchange rates
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Conversion Examples */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">
            Quick Reference
            <span className="text-xs text-blue-600 ml-2">• Live Market Rates</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {[10, 50, 100, 500, 1000].map((amount) => {
              const converted = CurrencyService.convertAmount(amount, converter.fromCurrency, converter.toCurrency);
              
              return (
                <div key={amount} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="text-gray-600">
                    {CurrencyService.formatCurrency(amount, converter.fromCurrency)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-gray-800">
                    {CurrencyService.formatCurrency(converted, converter.toCurrency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
