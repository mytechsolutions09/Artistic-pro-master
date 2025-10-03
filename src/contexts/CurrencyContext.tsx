import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import CurrencyService, { Currency, CurrencySettings } from '../services/currencyService';

interface CurrencyContextType {
  // Current currency settings
  currentCurrency: string;
  enabledCurrencies: Currency[];
  currencySettings: CurrencySettings;
  
  // Currency operations
  setCurrency: (currencyCode: string) => void;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
  formatCurrency: (amount: number, currencyCode?: string, fromCurrency?: string) => string;
  formatPrice: (amount: number, targetCurrency?: string) => string;
  formatAdminPrice: (amount: number, currencyCode?: string) => string;
  formatUIPrice: (amount: number, baseCurrency?: string, targetCurrency?: string) => string;
  getCurrency: (code: string) => Currency | null;
  
  // Currency management
  activateCurrency: (currencyCode: string) => { success: boolean; message: string };
  deactivateCurrency: (currencyCode: string) => { success: boolean; message: string };
  toggleCurrencyActivation: (currencyCode: string) => { success: boolean; message: string };
  updateDefaultCurrency: (currencyCode: string) => { success: boolean; message: string };
  canDeactivateCurrency: (currencyCode: string) => boolean;
  
  // Exchange rates
  updateExchangeRates: () => Promise<boolean>;
  isUpdating: boolean;
  lastUpdated: string;
  
  // UI helpers
  getCurrencySymbol: (code: string) => string;
  getCurrencyFlag: (code: string) => string;
  
  // Debug helpers
  forceRefreshCurrencyData: () => void;
  
  // Currency rate management
  updateCurrencyRate: (currencyCode: string, newRate: number) => { success: boolean; message: string };
  getAllCurrencyRates: () => Record<string, number>;
  resetCurrencyRates: () => { success: boolean; message: string };
  bulkUpdateCurrencyRates: (rates: Record<string, number>) => { success: boolean; message: string; errors: string[] };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<string>('INR');
  const [enabledCurrencies, setEnabledCurrencies] = useState<Currency[]>([]);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(
    CurrencyService.getCurrencySettings()
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Initialize currency data
  useEffect(() => {
    loadCurrencyData();
    
    // Set up auto-update if enabled
    CurrencyService.initializeAutoUpdate();
  }, []);

  // Load currency data from service
  const loadCurrencyData = () => {
    const settings = CurrencyService.getCurrencySettings();
    const currencies = CurrencyService.getEnabledCurrencies();
    
    setCurrencySettings(settings);
    setEnabledCurrencies(currencies);
    setCurrentCurrency(settings.defaultCurrency);
    setLastUpdated(settings.lastUpdated);
  };

  // Force refresh currency data (useful for debugging)
  const forceRefreshCurrencyData = () => {
    CurrencyService.forceRefreshSettings();
    loadCurrencyData();
  };

  // Currency rate management functions
  const updateCurrencyRate = (currencyCode: string, newRate: number) => {
    const result = CurrencyService.updateCurrencyRate(currencyCode, newRate);
    if (result.success) {
      loadCurrencyData(); // Refresh the data
    }
    return result;
  };

  const getAllCurrencyRates = () => {
    return CurrencyService.getAllCurrencyRates();
  };

  const resetCurrencyRates = () => {
    const result = CurrencyService.resetCurrencyRates();
    if (result.success) {
      loadCurrencyData(); // Refresh the data
    }
    return result;
  };

  const bulkUpdateCurrencyRates = (rates: Record<string, number>) => {
    const result = CurrencyService.bulkUpdateCurrencyRates(rates);
    if (result.success) {
      loadCurrencyData(); // Refresh the data
    }
    return result;
  };

  // Set current currency (user preference)
  const setCurrency = (currencyCode: string) => {
    const currency = CurrencyService.getCurrency(currencyCode);
    if (currency && currency.enabled) {
      setCurrentCurrency(currencyCode);
      // Store user preference in localStorage
      localStorage.setItem('user_preferred_currency', currencyCode);
    }
  };

  // Convert amount between currencies
  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    return CurrencyService.convertAmount(amount, fromCurrency, toCurrency);
  };

  // Format currency with symbol and conversion
  const formatCurrency = (amount: number, currencyCode?: string, fromCurrency: string = 'INR'): string => {
    const code = currencyCode || currentCurrency;
    
    // Convert the amount from the source currency to the target currency
    const convertedAmount = CurrencyService.convertAmount(amount, fromCurrency, code);
    
    // Format with the converted amount
    return CurrencyService.formatCurrency(convertedAmount, code);
  };

  // Helper function for formatting product prices (assumes INR as default source)
  const formatPrice = (amount: number, targetCurrency?: string): string => {
    return formatCurrency(amount, targetCurrency, 'INR');
  };

  // Helper function for admin - formats price in current currency without conversion
  const formatAdminPrice = (amount: number, currencyCode?: string): string => {
    const code = currencyCode || currentCurrency;
    return CurrencyService.formatCurrency(amount, code, 0); // Use 0 decimals
  };

  // Helper function for frontend UI - converts prices from source currency to display currency
  const formatUIPrice = (amount: number | undefined | null, sourceCurrency: string = 'INR', targetCurrency?: string): string => {
    // Handle undefined, null, or invalid amounts
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0'; // Default to INR with 0 amount, no decimals
    }
    
    const code = targetCurrency || currentCurrency;
    const convertedAmount = CurrencyService.convertAmount(amount, sourceCurrency, code);
    return CurrencyService.formatCurrency(convertedAmount, code, 0); // Use 0 decimals
  };

  // Get currency object
  const getCurrency = (code: string): Currency | null => {
    return CurrencyService.getCurrency(code);
  };

  // Update exchange rates
  const updateExchangeRates = async (): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const success = await CurrencyService.fetchExchangeRates();
      if (success) {
        loadCurrencyData();
      }
      return success;
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (code: string): string => {
    const currency = getCurrency(code);
    return currency?.symbol || code;
  };

  // Get currency flag
  const getCurrencyFlag = (code: string): string => {
    const currency = getCurrency(code);
    return currency?.flag || '🌍';
  };

  // Currency management functions
  const activateCurrency = (currencyCode: string) => {
    const result = CurrencyService.activateCurrency(currencyCode);
    if (result.success) {
      loadCurrencyData();
    }
    return result;
  };

  const deactivateCurrency = (currencyCode: string) => {
    const result = CurrencyService.deactivateCurrency(currencyCode);
    if (result.success) {
      loadCurrencyData();
    }
    return result;
  };

  const toggleCurrencyActivation = (currencyCode: string) => {
    const result = CurrencyService.toggleCurrencyActivation(currencyCode);
    if (result.success) {
      loadCurrencyData();
    }
    return result;
  };

  const updateDefaultCurrencyContext = (currencyCode: string) => {
    const result = CurrencyService.updateDefaultCurrency(currencyCode);
    if (result.success) {
      loadCurrencyData();
      setCurrentCurrency(currencyCode);
    }
    return result;
  };

  const canDeactivateCurrency = (currencyCode: string): boolean => {
    return CurrencyService.canDeactivateCurrency(currencyCode);
  };

  // Load user's preferred currency on mount
  useEffect(() => {
    const userPreference = localStorage.getItem('user_preferred_currency');
    if (userPreference) {
      const currency = CurrencyService.getCurrency(userPreference);
      if (currency && currency.enabled) {
        setCurrentCurrency(userPreference);
      }
    }
  }, [enabledCurrencies]);

  const contextValue: CurrencyContextType = {
    // Current currency settings
    currentCurrency,
    enabledCurrencies,
    currencySettings,
    
    // Currency operations
    setCurrency,
    convertAmount,
    formatCurrency,
    formatPrice,
    formatAdminPrice,
    formatUIPrice,
    getCurrency,
    
    // Currency management
    activateCurrency,
    deactivateCurrency,
    toggleCurrencyActivation,
    updateDefaultCurrency: updateDefaultCurrencyContext,
    canDeactivateCurrency,
    
    // Exchange rates
    updateExchangeRates,
    isUpdating,
    lastUpdated,
    
    // UI helpers
    getCurrencySymbol,
    getCurrencyFlag,
    
    // Debug helpers
    forceRefreshCurrencyData,
    
    // Currency rate management
    updateCurrencyRate,
    getAllCurrencyRates,
    resetCurrencyRates,
    bulkUpdateCurrencyRates
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// HOC for components that need currency conversion
export const withCurrency = <P extends object>(
  Component: React.ComponentType<P & { currency: CurrencyContextType }>
) => {
  return (props: P) => {
    const currency = useCurrency();
    return <Component {...props} currency={currency} />;
  };
};

export default CurrencyContext;
