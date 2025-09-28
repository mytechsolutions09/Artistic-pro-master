import React from 'react';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AdminCurrencyDisplayProps {
  amount: number;
  fromCurrency?: string;
  showConversions?: boolean;
  className?: string;
}

const AdminCurrencyDisplay: React.FC<AdminCurrencyDisplayProps> = ({
  amount,
  fromCurrency = 'USD',
  showConversions = false,
  className = ''
}) => {
  const {
    currentCurrency,
    enabledCurrencies,
    convertAmount,
    formatCurrency,
    isUpdating,
    lastUpdated
  } = useCurrency();

  const convertedAmount = convertAmount(amount, fromCurrency, currentCurrency);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary display in current currency */}
      <div className="flex items-center space-x-2">
        <DollarSign className="w-4 h-4 text-gray-500" />
        <span className="text-lg font-semibold">
          {formatCurrency(convertedAmount, currentCurrency)}
        </span>
        {currentCurrency !== fromCurrency && (
          <span className="text-sm text-gray-500">
            (from {formatCurrency(amount, fromCurrency)})
          </span>
        )}
      </div>

      {/* Show conversions to other enabled currencies */}
      {showConversions && enabledCurrencies.length > 1 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Other currencies:</span>
            {isUpdating && <RefreshCw className="w-3 h-3 animate-spin" />}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {enabledCurrencies
              .filter(currency => currency.code !== currentCurrency)
              .slice(0, 4) // Show max 4 additional currencies
              .map(currency => {
                const converted = convertAmount(amount, fromCurrency, currency.code);
                return (
                  <div key={currency.code} className="text-gray-600">
                    <span className="font-medium">{currency.code}:</span>{' '}
                    {formatCurrency(converted, currency.code)}
                  </div>
                );
              })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCurrencyDisplay;
