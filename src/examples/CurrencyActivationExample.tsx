// Example demonstrating currency activation/deactivation and default currency functions
import React, { useState } from 'react';
import CurrencyService from '../services/currencyService';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencyActivationExample: React.FC = () => {
  const {
    activateCurrency,
    deactivateCurrency,
    toggleCurrencyActivation,
    updateDefaultCurrency,
    canDeactivateCurrency,
    enabledCurrencies,
    currencySettings
  } = useCurrency();

  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Example 1: Activate a currency
  const activateEUR = () => {
    const result = activateCurrency('EUR');
    addResult(`Activate EUR: ${result.message}`);
  };

  // Example 2: Deactivate a currency
  const deactivateCAD = () => {
    const result = deactivateCurrency('CAD');
    addResult(`Deactivate CAD: ${result.message}`);
  };

  // Example 3: Toggle currency activation
  const toggleJPY = () => {
    const result = toggleCurrencyActivation('JPY');
    addResult(`Toggle JPY: ${result.message}`);
  };

  // Example 4: Change default currency
  const setGBPDefault = () => {
    const result = updateDefaultCurrency('GBP');
    addResult(`Set GBP as default: ${result.message}`);
  };

  // Example 5: Check if currency can be deactivated
  const checkDeactivation = (code: string) => {
    const canDeactivate = canDeactivateCurrency(code);
    addResult(`Can deactivate ${code}: ${canDeactivate ? 'Yes' : 'No'}`);
  };

  // Example 6: Service-level functions (without context)
  const serviceExamples = () => {
    // Get currency details
    const usdDetails = CurrencyService.getCurrencyDetails('USD');
    addResult(`USD Details: ${JSON.stringify(usdDetails)}`);

    // Get available default currencies
    const availableDefaults = CurrencyService.getAvailableDefaultCurrencies();
    addResult(`Available for default: ${availableDefaults.map(c => c.code).join(', ')}`);

    // Get currency stats
    const stats = CurrencyService.getCurrencyStats();
    addResult(`Stats: ${stats.enabled} active, ${stats.disabled} inactive`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Currency Activation/Deactivation Examples</h1>

      {/* Current Status */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Current Status:</h3>
        <p><strong>Default Currency:</strong> {currencySettings.defaultCurrency}</p>
        <p><strong>Active Currencies:</strong> {enabledCurrencies.map(c => c.code).join(', ')}</p>
        <p><strong>Auto-Update:</strong> {currencySettings.autoUpdate ? 'Enabled' : 'Disabled'}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={activateEUR}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Activate EUR
        </button>
        
        <button
          onClick={deactivateCAD}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Deactivate CAD
        </button>
        
        <button
          onClick={toggleJPY}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle JPY
        </button>
        
        <button
          onClick={setGBPDefault}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Set GBP Default
        </button>
        
        <button
          onClick={() => checkDeactivation('USD')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Check USD Deactivation
        </button>
        
        <button
          onClick={serviceExamples}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Service Examples
        </button>
      </div>

      {/* Results Log */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Function Results:</h3>
          <button
            onClick={() => setResults([])}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {results.length === 0 ? (
            <p className="text-gray-500 italic">Click buttons above to test functions...</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Code Examples */}
      <div className="mt-8 bg-gray-900 text-white p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-green-400">Code Examples:</h3>
        <pre className="text-sm overflow-x-auto">
{`// Using Currency Context
const { activateCurrency, deactivateCurrency, updateDefaultCurrency } = useCurrency();

// Activate a currency
const result = activateCurrency('EUR');
if (result.success) {

} else {
  console.error(result.message);
}

// Change default currency
const defaultResult = updateDefaultCurrency('GBP');


// Using Currency Service directly
import CurrencyService from '../services/currencyService';

// Toggle currency activation
const toggleResult = CurrencyService.toggleCurrencyActivation('JPY');

// Check if currency can be deactivated
const canDeactivate = CurrencyService.canDeactivateCurrency('USD');

// Get currency details
const details = CurrencyService.getCurrencyDetails('EUR');


        </pre>
      </div>

      {/* Function Reference */}
      <div className="mt-6 bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Function Reference:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Context Functions:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <code>activateCurrency(code)</code></li>
              <li>• <code>deactivateCurrency(code)</code></li>
              <li>• <code>toggleCurrencyActivation(code)</code></li>
              <li>• <code>updateDefaultCurrency(code)</code></li>
              <li>• <code>canDeactivateCurrency(code)</code></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-600 mb-2">Service Functions:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <code>CurrencyService.activateCurrency(code)</code></li>
              <li>• <code>CurrencyService.deactivateCurrency(code)</code></li>
              <li>• <code>CurrencyService.updateDefaultCurrency(code)</code></li>
              <li>• <code>CurrencyService.getCurrencyDetails(code)</code></li>
              <li>• <code>CurrencyService.getAvailableDefaultCurrencies()</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyActivationExample;
