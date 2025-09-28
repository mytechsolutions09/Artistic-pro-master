// Currency System for Artistic Pro
// Supports multiple currencies with real-time conversion

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number; // Rate relative to USD (base currency)
}

export const CURRENCIES: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    exchangeRate: 1.0 // Base currency
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    exchangeRate: 0.85
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    exchangeRate: 0.73
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    exchangeRate: 1.35
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    exchangeRate: 1.52
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    exchangeRate: 149.50
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    flag: '🇨🇭',
    exchangeRate: 0.88
  },
  {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr',
    flag: '🇸🇪',
    exchangeRate: 10.85
  },
  {
    code: 'NOK',
    name: 'Norwegian Krone',
    symbol: 'kr',
    flag: '🇳🇴',
    exchangeRate: 10.95
  },
  {
    code: 'DKK',
    name: 'Danish Krone',
    symbol: 'kr',
    flag: '🇩🇰',
    exchangeRate: 6.35
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    exchangeRate: 83.25
  }
];

// Default currency
export const DEFAULT_CURRENCY = CURRENCIES[0]; // USD

// Currency conversion utilities
export const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const from = CURRENCIES.find(c => c.code === fromCurrency);
  const to = CURRENCIES.find(c => c.code === toCurrency);
  
  if (!from || !to) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / from.exchangeRate;
  return usdAmount * to.exchangeRate;
};

export const formatPrice = (amount: number, currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `$${amount.toFixed(2)}`;
  
  // Format based on currency
  if (currencyCode === 'JPY') {
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${currency.symbol}${amount.toFixed(2)}`;
};

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(c => c.code === code);
};

// Currency context for React
export const CURRENCY_STORAGE_KEY = 'artistic-pro-currency';

export const getStoredCurrency = (): Currency => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored) {
      const currency = getCurrencyByCode(stored);
      if (currency) return currency;
    }
  }
  return DEFAULT_CURRENCY;
};

export const setCurrency = (currency: Currency): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency.code);
  }
};
