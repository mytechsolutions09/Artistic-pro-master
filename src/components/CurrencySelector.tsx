import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, DollarSign, Check } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

interface CurrencySelectorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'navbar';
  showFlag?: boolean;
  showName?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  variant = 'default',
  showFlag = true,
  showName = false
}) => {
  const {
    currentCurrency,
    enabledCurrencies,
    setCurrency,
    getCurrencySymbol,
    getCurrencyFlag
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrency(currencyCode);
    setIsOpen(false);
  };

  const currentCurrencyData = enabledCurrencies.find(c => c.code === currentCurrency);

  // Different styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          button: 'px-2 py-1 text-sm',
          dropdown: 'w-40',
          item: 'px-3 py-2 text-sm'
        };
      case 'navbar':
        return {
          button: 'px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white',
          dropdown: 'w-48 bg-white border border-gray-200 shadow-lg',
          item: 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
        };
      default:
        return {
          button: 'px-4 py-2',
          dropdown: 'w-56',
          item: 'px-4 py-3'
        };
    }
  };

  const styles = getVariantStyles();

  if (enabledCurrencies.length <= 1) {
    // Show read-only currency if only one enabled
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <DollarSign className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium">
          {showFlag && currentCurrencyData && (
            <span className="mr-1">{getCurrencyFlag(currentCurrency)}</span>
          )}
          {currentCurrency}
          {showName && currentCurrencyData && (
            <span className="ml-1 text-gray-500">- {currentCurrencyData.name}</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between space-x-2 border border-gray-200 rounded-lg 
          hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 
          transition-colors ${styles.button}
          ${variant === 'navbar' ? styles.button : 'bg-white'}
        `}
      >
        <div className="flex items-center space-x-2">
          {showFlag && currentCurrencyData && (
            <span>{getCurrencyFlag(currentCurrency)}</span>
          )}
          <span className="font-medium">
            {getCurrencySymbol(currentCurrency)} {currentCurrency}
          </span>
          {showName && currentCurrencyData && (
            <span className="text-gray-500 hidden sm:inline">
              - {currentCurrencyData.name}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-1 rounded-lg shadow-lg border z-50
          ${styles.dropdown}
          ${variant === 'navbar' ? styles.dropdown : 'bg-white border-gray-200'}
        `}>
          <div className="py-1">
            {enabledCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`
                  w-full text-left flex items-center justify-between
                  hover:bg-gray-50 transition-colors ${styles.item}
                  ${variant === 'navbar' ? styles.item : 'text-gray-700'}
                `}
              >
                <div className="flex items-center space-x-3">
                  {showFlag && (
                    <span className="text-lg">{currency.flag}</span>
                  )}
                  <div>
                    <div className="font-medium">
                      {currency.symbol} {currency.code}
                    </div>
                    {showName && (
                      <div className="text-xs text-gray-500">{currency.name}</div>
                    )}
                  </div>
                </div>
                {currency.code === currentCurrency && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
