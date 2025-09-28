import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { CurrencyService } from '../../../services/currencyService';
import { Edit3, Save, RotateCcw, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface CurrencyRateManagerProps {
  className?: string;
}

const CurrencyRateManager: React.FC<CurrencyRateManagerProps> = ({ className = '' }) => {
  const { 
    getAllCurrencyRates, 
    updateCurrencyRate, 
    resetCurrencyRates, 
    bulkUpdateCurrencyRates,
    forceRefreshCurrencyData 
  } = useCurrency();
  
  const [rates, setRates] = useState<Record<string, number>>({});
  const [editingRates, setEditingRates] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Load currency rates on component mount
  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = () => {
    const currentRates = getAllCurrencyRates();
    setRates(currentRates);
    setEditingRates({ ...currentRates });
    setLastUpdated(new Date().toLocaleString());
  };

  const handleRateChange = (currency: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEditingRates(prev => ({
        ...prev,
        [currency]: numValue
      }));
    }
  };

  const startEditing = (currency: string) => {
    setIsEditing(prev => ({
      ...prev,
      [currency]: true
    }));
  };

  const saveRate = async (currency: string) => {
    setIsSaving(true);
    try {
      const result = updateCurrencyRate(currency, editingRates[currency]);
      if (result.success) {
        setRates(prev => ({
          ...prev,
          [currency]: editingRates[currency]
        }));
        setIsEditing(prev => ({
          ...prev,
          [currency]: false
        }));
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update rate' });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = (currency: string) => {
    setEditingRates(prev => ({
      ...prev,
      [currency]: rates[currency]
    }));
    setIsEditing(prev => ({
      ...prev,
      [currency]: false
    }));
  };

  const saveAllRates = async () => {
    setIsSaving(true);
    try {
      const result = bulkUpdateCurrencyRates(editingRates);
      if (result.success) {
        setRates({ ...editingRates });
        setIsEditing({});
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
        if (result.errors.length > 0) {
          setMessage({ type: 'error', text: result.errors.join(', ') });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update rates' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all currency rates to defaults?')) {
      setIsSaving(true);
      try {
        const result = resetCurrencyRates();
        if (result.success) {
          loadRates();
          setMessage({ type: 'success', text: result.message });
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to reset rates' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRefresh = () => {
    forceRefreshCurrencyData();
    loadRates();
    setMessage({ type: 'success', text: 'Currency data refreshed' });
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const currencies = CurrencyService.SUPPORTED_CURRENCIES.filter(c => c.enabled);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Currency Rate Manager</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage exchange rates for all supported currencies
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {currencies.map((currency) => (
            <div key={currency.code} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currency.flag}</span>
                <div>
                  <div className="font-medium text-gray-900">{currency.name}</div>
                  <div className="text-sm text-gray-500">{currency.code} - {currency.symbol}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isEditing[currency.code] ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={editingRates[currency.code] || ''}
                      onChange={(e) => handleRateChange(currency.code, e.target.value)}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="0.0000"
                    />
                    <button
                      onClick={() => saveRate(currency.code)}
                      disabled={isSaving}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelEditing(currency.code)}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono text-gray-900">
                      {rates[currency.code]?.toFixed(4) || '0.0000'}
                    </span>
                    <button
                      onClick={() => startEditing(currency.code)}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>• Rates are relative to INR (Indian Rupee)</p>
              <p>• Changes are saved immediately</p>
              <p>• Use "Reset" to restore default rates</p>
            </div>
            <button
              onClick={saveAllRates}
              disabled={isSaving || Object.keys(isEditing).length === 0}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyRateManager;
