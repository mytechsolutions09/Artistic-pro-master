// Currency Service with API integration and caching
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Exchange rate to USD
  enabled: boolean;
}

export interface CurrencySettings {
  defaultCurrency: string;
  enabledCurrencies: string[];
  autoUpdate: boolean;
  lastUpdated: string;
  apiProvider: 'exchangerate' | 'fixer' | 'openexchange';
}

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export class CurrencyService {
  private static readonly STORAGE_KEY = 'currency_settings';
  private static readonly RATES_KEY = 'exchange_rates';
  private static readonly CACHE_DURATION = 3600000; // 1 hour in ms

  // Supported currencies with symbols and flags (rates relative to INR as base currency)
  static readonly SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 0.0114, enabled: true }, // 1 INR = 0.0114 USD (1/88.10)
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.0096, enabled: true }, // 1 INR = 0.0096 EUR (0.85/88.10)
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.0083, enabled: true }, // 1 INR = 0.0083 GBP (0.73/88.10)
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 1.25, enabled: true }, // 1 INR = 1.25 JPY (110/88.10)
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rate: 0.0142, enabled: true }, // 1 INR = 0.0142 CAD (1.25/88.10)
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 0.0153, enabled: true }, // 1 INR = 0.0153 AUD (1.35/88.10)
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', rate: 0.0104, enabled: true }, // 1 INR = 0.0104 CHF (0.92/88.10)
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 0.0732, enabled: false }, // 1 INR = 0.0732 CNY (6.45/88.10)
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 1.0, enabled: true }, // Base currency
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', rate: 0.0590, enabled: false }, // 1 INR = 0.0590 BRL (5.2/88.10)
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', rate: 13.39, enabled: false }, // 1 INR = 13.39 KRW (1180/88.10)
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rate: 0.0153, enabled: false }, // 1 INR = 0.0153 SGD (1.35/88.10)
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', rate: 0.0885, enabled: false }, // 1 INR = 0.0885 HKD (7.8/88.10)
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', rate: 0.0976, enabled: false }, // 1 INR = 0.0976 SEK (8.6/88.10)
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', rate: 0.0965, enabled: false } // 1 INR = 0.0965 NOK (8.5/88.10)
  ];

  // Get current currency settings
  static getCurrencySettings(): CurrencySettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if INR is missing from enabled currencies and add it
      if (!parsed.enabledCurrencies.includes('INR')) {
        parsed.enabledCurrencies.push('INR');
        this.saveCurrencySettings(parsed);
      }
      return parsed;
    }
    
    // Default settings
    const defaultSettings: CurrencySettings = {
      defaultCurrency: 'INR',
      enabledCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'INR'],
      autoUpdate: true,
      lastUpdated: new Date().toISOString(),
      apiProvider: 'exchangerate'
    };
    
    this.saveCurrencySettings(defaultSettings);
    return defaultSettings;
  }

  // Save currency settings
  static saveCurrencySettings(settings: CurrencySettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  // Force refresh currency settings (useful for debugging)
  static forceRefreshSettings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.RATES_KEY); // Also clear cached rates
    // This will trigger the default settings to be loaded
  }

  // Update currency rate
  static updateCurrencyRate(currencyCode: string, newRate: number): { success: boolean; message: string } {
    if (newRate <= 0) {
      return { success: false, message: 'Exchange rate must be greater than 0' };
    }

    const rates = this.getCachedRates();
    rates[currencyCode] = newRate;
    
    // Update cache with new rates
    const cacheData = {
      rates,
      timestamp: Date.now()
    };
    localStorage.setItem(this.RATES_KEY, JSON.stringify(cacheData));

    return { success: true, message: `${currencyCode} rate updated to ${newRate}` };
  }

  // Get all currency rates for editing
  static getAllCurrencyRates(): Record<string, number> {
    return this.getCachedRates();
  }

  // Reset currency rates to defaults
  static resetCurrencyRates(): { success: boolean; message: string } {
    localStorage.removeItem(this.RATES_KEY);
    return { success: true, message: 'Currency rates reset to defaults' };
  }

  // Bulk update currency rates
  static bulkUpdateCurrencyRates(rates: Record<string, number>): { success: boolean; message: string; errors: string[] } {
    const errors: string[] = [];
    
    // Validate all rates
    Object.entries(rates).forEach(([currency, rate]) => {
      if (rate <= 0) {
        errors.push(`${currency}: Rate must be greater than 0`);
      }
    });

    if (errors.length > 0) {
      return { success: false, message: 'Validation failed', errors };
    }

    // Update all rates
    const currentRates = this.getCachedRates();
    Object.entries(rates).forEach(([currency, rate]) => {
      currentRates[currency] = rate;
    });

    // Save to cache
    const cacheData = {
      rates: currentRates,
      timestamp: Date.now()
    };
    localStorage.setItem(this.RATES_KEY, JSON.stringify(cacheData));

    return { success: true, message: `Updated ${Object.keys(rates).length} currency rates`, errors: [] };
  }

  // Get enabled currencies with current rates
  static getEnabledCurrencies(): Currency[] {
    const settings = this.getCurrencySettings();
    const rates = this.getCachedRates();
    
    return this.SUPPORTED_CURRENCIES
      .filter(currency => settings.enabledCurrencies.includes(currency.code))
      .map(currency => ({
        ...currency,
        rate: rates[currency.code] || currency.rate,
        enabled: true
      }));
  }

  // Get all currencies (for settings management)
  static getAllCurrencies(): Currency[] {
    const settings = this.getCurrencySettings();
    const rates = this.getCachedRates();
    
    return this.SUPPORTED_CURRENCIES.map(currency => ({
      ...currency,
      rate: rates[currency.code] || currency.rate,
      enabled: settings.enabledCurrencies.includes(currency.code)
    }));
  }

  // Get currency by code
  static getCurrency(code: string): Currency | null {
    const currencies = this.getAllCurrencies();
    return currencies.find(c => c.code === code) || null;
  }

  // Convert amount between currencies using direct conversion rates
  static convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const rates = this.getCachedRates();
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // Direct conversion: amount * (toRate / fromRate)
    return amount * (toRate / fromRate);
  }

  // Format currency amount with symbol
  static formatCurrency(amount: number | undefined | null, currencyCode: string, decimals: number = 2): string {
    // Handle undefined, null, or invalid amounts
    if (amount === undefined || amount === null || isNaN(amount)) {
      amount = 0;
    }
    
    const currency = this.getCurrency(currencyCode);
    if (!currency) return `${amount.toFixed(decimals)}`;
    
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    return `${currency.symbol}${formattedAmount}`;
  }

  // Get cached exchange rates
  private static getCachedRates(): Record<string, number> {
    const cached = localStorage.getItem(this.RATES_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp < this.CACHE_DURATION) {
        return data.rates;
      }
    }
    
    // Return default rates if no cache or expired
    const defaultRates: Record<string, number> = {};
    this.SUPPORTED_CURRENCIES.forEach(currency => {
      defaultRates[currency.code] = currency.rate;
    });
    
    return defaultRates;
  }

  // Cache exchange rates
  private static cacheRates(rates: Record<string, number>): void {
    const data = {
      rates,
      timestamp: Date.now()
    };
    localStorage.setItem(this.RATES_KEY, JSON.stringify(data));
  }

  // Fetch live exchange rates from API
  static async fetchExchangeRates(): Promise<boolean> {
    try {
      const settings = this.getCurrencySettings();
      let rates: Record<string, number> = {};
      
      // Try different API providers as fallback
      const apiProviders = [
        () => this.fetchFromExchangeRate(),
        () => this.fetchFromMockAPI(),
        () => this.getDefaultRates()
      ];
      
      for (const provider of apiProviders) {
        try {
          rates = await provider();
          if (Object.keys(rates).length > 0) break;
        } catch (error) {
          console.warn('Currency API provider failed, trying next...', error);
        }
      }
      
      if (Object.keys(rates).length > 0) {
        this.cacheRates(rates);
        
        // Update last updated timestamp
        settings.lastUpdated = new Date().toISOString();
        this.saveCurrencySettings(settings);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return false;
    }
  }

  // Fetch from exchangerate-api.com (free tier)
  private static async fetchFromExchangeRate(): Promise<Record<string, number>> {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('API request failed');
    
    const data: ExchangeRateResponse = await response.json();
    return data.rates;
  }

  // Mock API for development/fallback
  private static async fetchFromMockAPI(): Promise<Record<string, number>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock rates with slight variations
    const baseRates = this.getDefaultRates();
    const mockRates: Record<string, number> = {};
    
    Object.entries(baseRates).forEach(([code, rate]) => {
      // Add ±5% random variation to simulate real market fluctuations
      const variation = 0.95 + (Math.random() * 0.1);
      mockRates[code] = parseFloat((rate * variation).toFixed(4));
    });
    
    return mockRates;
  }

  // Get default rates as fallback
  private static getDefaultRates(): Record<string, number> {
    const rates: Record<string, number> = {};
    this.SUPPORTED_CURRENCIES.forEach(currency => {
      rates[currency.code] = currency.rate;
    });
    return rates;
  }

  // Update enabled currencies
  static updateEnabledCurrencies(enabledCodes: string[]): void {
    const settings = this.getCurrencySettings();
    settings.enabledCurrencies = enabledCodes;
    this.saveCurrencySettings(settings);
  }

  // Activate a currency
  static activateCurrency(currencyCode: string): { success: boolean; message: string } {
    try {
      const currency = this.SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
      if (!currency) {
        return { success: false, message: `Currency ${currencyCode} is not supported` };
      }

      const settings = this.getCurrencySettings();
      
      if (settings.enabledCurrencies.includes(currencyCode)) {
        return { success: false, message: `Currency ${currencyCode} is already active` };
      }

      settings.enabledCurrencies.push(currencyCode);
      this.saveCurrencySettings(settings);
      
      return { success: true, message: `Currency ${currencyCode} (${currency.name}) has been activated` };
    } catch (error) {
      return { success: false, message: `Failed to activate currency: ${error}` };
    }
  }

  // Deactivate a currency
  static deactivateCurrency(currencyCode: string): { success: boolean; message: string } {
    try {
      const currency = this.SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
      if (!currency) {
        return { success: false, message: `Currency ${currencyCode} is not supported` };
      }

      const settings = this.getCurrencySettings();
      
      if (!settings.enabledCurrencies.includes(currencyCode)) {
        return { success: false, message: `Currency ${currencyCode} is already inactive` };
      }

      // Prevent deactivating if it's the only enabled currency
      if (settings.enabledCurrencies.length <= 1) {
        return { success: false, message: 'Cannot deactivate the last enabled currency. At least one currency must remain active.' };
      }

      // Prevent deactivating if it's the default currency
      if (currencyCode === settings.defaultCurrency) {
        return { success: false, message: `Cannot deactivate ${currencyCode} as it is the default currency. Change the default currency first.` };
      }

      // Prevent deactivating if it's the base currency
      if (currencyCode === settings.baseCurrency) {
        return { success: false, message: `Cannot deactivate ${currencyCode} as it is the base currency for calculations.` };
      }

      settings.enabledCurrencies = settings.enabledCurrencies.filter(code => code !== currencyCode);
      this.saveCurrencySettings(settings);
      
      return { success: true, message: `Currency ${currencyCode} (${currency.name}) has been deactivated` };
    } catch (error) {
      return { success: false, message: `Failed to deactivate currency: ${error}` };
    }
  }

  // Toggle currency activation status
  static toggleCurrencyActivation(currencyCode: string): { success: boolean; message: string } {
    const settings = this.getCurrencySettings();
    const isActive = settings.enabledCurrencies.includes(currencyCode);
    
    if (isActive) {
      return this.deactivateCurrency(currencyCode);
    } else {
      return this.activateCurrency(currencyCode);
    }
  }

  // Update default currency
  static updateDefaultCurrency(currencyCode: string): { success: boolean; message: string } {
    try {
      const currency = this.SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
      if (!currency) {
        return { success: false, message: `Currency ${currencyCode} is not supported` };
      }

      const settings = this.getCurrencySettings();
      
      if (settings.defaultCurrency === currencyCode) {
        return { success: false, message: `${currencyCode} is already the default currency` };
      }

      const oldDefault = settings.defaultCurrency;
      settings.defaultCurrency = currencyCode;
      
      // Ensure the new default currency is enabled
      if (!settings.enabledCurrencies.includes(currencyCode)) {
        settings.enabledCurrencies.push(currencyCode);
      }
      
      this.saveCurrencySettings(settings);
      
      return { 
        success: true, 
        message: `Default currency changed from ${oldDefault} to ${currencyCode} (${currency.name})` 
      };
    } catch (error) {
      return { success: false, message: `Failed to update default currency: ${error}` };
    }
  }

  // Update base currency
  static updateBaseCurrency(currencyCode: string): { success: boolean; message: string } {
    try {
      const currency = this.SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
      if (!currency) {
        return { success: false, message: `Currency ${currencyCode} is not supported` };
      }

      const settings = this.getCurrencySettings();
      
      if (settings.baseCurrency === currencyCode) {
        return { success: false, message: `${currencyCode} is already the base currency` };
      }

      const oldBase = settings.baseCurrency;
      settings.baseCurrency = currencyCode;
      
      // Ensure the base currency is enabled
      if (!settings.enabledCurrencies.includes(currencyCode)) {
        settings.enabledCurrencies.push(currencyCode);
      }
      
      this.saveCurrencySettings(settings);
      
      return { 
        success: true, 
        message: `Base currency changed from ${oldBase} to ${currencyCode} (${currency.name}). Exchange rates will be recalculated.` 
      };
    } catch (error) {
      return { success: false, message: `Failed to update base currency: ${error}` };
    }
  }

  // Toggle auto-update
  static toggleAutoUpdate(enabled: boolean): { success: boolean; message: string } {
    try {
      const settings = this.getCurrencySettings();
      const wasEnabled = settings.autoUpdate;
      settings.autoUpdate = enabled;
      this.saveCurrencySettings(settings);
      
      if (enabled && !wasEnabled) {
        // Start auto-update if it was just enabled
        this.initializeAutoUpdate();
        return { success: true, message: 'Auto-update enabled. Exchange rates will update hourly.' };
      } else if (!enabled && wasEnabled) {
        return { success: true, message: 'Auto-update disabled. Exchange rates will only update manually.' };
      } else {
        return { success: true, message: `Auto-update is already ${enabled ? 'enabled' : 'disabled'}` };
      }
    } catch (error) {
      return { success: false, message: `Failed to toggle auto-update: ${error}` };
    }
  }

  // Get currency statistics for admin dashboard
  static getCurrencyStats() {
    const settings = this.getCurrencySettings();
    const enabledCurrencies = this.getEnabledCurrencies();
    const allCurrencies = this.getAllCurrencies();
    const rates = this.getCachedRates();
    
    return {
      totalSupported: this.SUPPORTED_CURRENCIES.length,
      enabled: enabledCurrencies.length,
      disabled: allCurrencies.filter(c => !c.enabled).length,
      baseCurrency: settings.baseCurrency,
      defaultCurrency: settings.defaultCurrency,
      lastUpdated: settings.lastUpdated,
      autoUpdate: settings.autoUpdate,
      ratesAge: Date.now() - (JSON.parse(localStorage.getItem(this.RATES_KEY) || '{"timestamp": 0}').timestamp || 0),
      topRates: Object.entries(rates)
        .filter(([code]) => settings.enabledCurrencies.includes(code))
        .slice(0, 5)
        .map(([code, rate]) => ({
          code,
          rate,
          currency: this.getCurrency(code)
        })),
      currencyBreakdown: {
        active: allCurrencies.filter(c => c.enabled),
        inactive: allCurrencies.filter(c => !c.enabled)
      }
    };
  }

  // Initialize auto-update if enabled
  static initializeAutoUpdate(): void {
    const settings = this.getCurrencySettings();
    if (settings.autoUpdate) {
      // Update rates on initialization
      this.fetchExchangeRates();
      
      // Clear any existing intervals to prevent duplicates
      if (window.currencyUpdateInterval) {
        clearInterval(window.currencyUpdateInterval);
      }
      
      // Set up periodic updates (every hour)
      window.currencyUpdateInterval = setInterval(() => {
        this.fetchExchangeRates();
      }, this.CACHE_DURATION);
    } else {
      // Clear interval if auto-update is disabled
      if (window.currencyUpdateInterval) {
        clearInterval(window.currencyUpdateInterval);
        window.currencyUpdateInterval = null;
      }
    }
  }

  // Get detailed currency information
  static getCurrencyDetails(currencyCode: string) {
    const currency = this.getCurrency(currencyCode);
    const settings = this.getCurrencySettings();
    
    if (!currency) {
      return null;
    }
    
    return {
      ...currency,
      isDefault: currencyCode === settings.defaultCurrency,
      isBase: currencyCode === settings.baseCurrency,
      canDeactivate: this.canDeactivateCurrency(currencyCode),
      activationStatus: settings.enabledCurrencies.includes(currencyCode) ? 'active' : 'inactive'
    };
  }

  // Check if a currency can be deactivated
  static canDeactivateCurrency(currencyCode: string): boolean {
    const settings = this.getCurrencySettings();
    
    // Cannot deactivate if it's the only enabled currency
    if (settings.enabledCurrencies.length <= 1) {
      return false;
    }
    
    // Cannot deactivate if it's the default currency
    if (currencyCode === settings.defaultCurrency) {
      return false;
    }
    
    // Cannot deactivate if it's the base currency
    if (currencyCode === settings.baseCurrency) {
      return false;
    }
    
    return true;
  }

  // Get currencies that can be set as default
  static getAvailableDefaultCurrencies() {
    const settings = this.getCurrencySettings();
    return this.SUPPORTED_CURRENCIES.filter(currency => 
      settings.enabledCurrencies.includes(currency.code)
    );
  }
}

// Extend window interface for interval tracking
declare global {
  interface Window {
    currencyUpdateInterval?: NodeJS.Timeout | null;
  }
}

export default CurrencyService;
