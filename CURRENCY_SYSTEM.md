# Currency Converter System Documentation

## Overview

The Currency Converter System provides comprehensive multi-currency support for the Artistic Pro platform. It includes live exchange rates, currency management, and seamless conversion throughout the admin dashboard.

## 🚀 Features

### Core Functionality
- **15 Supported Currencies**: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, KRW, SGD, HKD, SEK, NOK
- **Live Exchange Rates**: API integration with automatic updates
- **Smart Caching**: 1-hour cache with fallback to default rates
- **Currency Context**: App-wide currency state management
- **Admin Settings**: Complete currency management interface

### API Integration
- **Primary**: exchangerate-api.com (free tier)
- **Fallback**: Mock API with realistic rate variations
- **Default**: Hardcoded rates as final fallback
- **Auto-Update**: Hourly updates when enabled

## 📁 File Structure

```
src/
├── services/
│   └── currencyService.ts          # Core currency service with API integration
├── contexts/
│   └── CurrencyContext.tsx         # React context for app-wide currency state
├── components/
│   ├── CurrencySelector.tsx        # Reusable currency selector component
│   └── admin/
│       └── AdminCurrencyDisplay.tsx # Admin dashboard currency display
├── pages/admin/
│   └── Settings.tsx               # Enhanced settings with currency management
└── CURRENCY_SYSTEM.md             # This documentation
```

## 🛠️ Implementation

### 1. Currency Service (`currencyService.ts`)

```typescript
// Core currency operations
CurrencyService.convertAmount(100, 'USD', 'EUR')
CurrencyService.formatCurrency(100, 'EUR') // "€100.00"
CurrencyService.fetchExchangeRates() // Update from API
CurrencyService.updateDefaultCurrency('EUR')
```

### 2. Currency Context (`CurrencyContext.tsx`)

```typescript
// Wrap your app with CurrencyProvider
<CurrencyProvider>
  <App />
</CurrencyProvider>

// Use in components
const { currentCurrency, formatCurrency, setCurrency } = useCurrency();
```

### 3. Currency Selector Component

```typescript
// Basic usage
<CurrencySelector />

// Compact navbar variant
<CurrencySelector variant="navbar" showFlag={true} />

// Full details
<CurrencySelector variant="default" showFlag={true} showName={true} />
```

## ⚙️ Settings Integration

### Currency Management Panel
- **Enable/Disable Currencies**: Toggle individual currencies on/off
- **Default Currency**: Set platform default for new transactions
- **Auto-Update**: Enable/disable automatic rate updates
- **Live Statistics**: Total, enabled, last update time

### Currency Converter Tool
- **Real-time Conversion**: Live conversion between enabled currencies
- **Quick Reference**: Pre-calculated common amounts (10, 50, 100, 500, 1000)
- **Exchange Rate Display**: Current rates with update timestamps
- **Swap Function**: Quick currency pair reversal

### Exchange Rate Management
- **API Updates**: One-click rate refresh from live APIs
- **Cache Status**: Visual indicators for rate freshness
- **Error Handling**: Graceful fallback to cached/default rates
- **Update History**: Timestamp tracking for all updates

## 🎯 Usage Examples

### Basic Currency Display
```typescript
import { useCurrency } from '../contexts/CurrencyContext';

const PriceDisplay = ({ amount }: { amount: number }) => {
  const { formatCurrency, currentCurrency } = useCurrency();
  return <span>{formatCurrency(amount, currentCurrency)}</span>;
};
```

### Multi-Currency Admin Display
```typescript
import AdminCurrencyDisplay from '../components/admin/AdminCurrencyDisplay';

<AdminCurrencyDisplay 
  amount={299.99} 
  fromCurrency="USD" 
  showConversions={true} 
/>
```

### Currency Conversion
```typescript
const { convertAmount } = useCurrency();
const euroPrice = convertAmount(100, 'USD', 'EUR');
```

## 📊 Supported Currencies

| Code | Name | Symbol | Flag | Default Rate |
|------|------|--------|------|--------------|
| USD | US Dollar | $ | 🇺🇸 | 1.0000 (base) |
| EUR | Euro | € | 🇪🇺 | 0.8500 |
| GBP | British Pound | £ | 🇬🇧 | 0.7300 |
| JPY | Japanese Yen | ¥ | 🇯🇵 | 110.0000 |
| CAD | Canadian Dollar | C$ | 🇨🇦 | 1.2500 |
| AUD | Australian Dollar | A$ | 🇦🇺 | 1.3500 |
| CHF | Swiss Franc | Fr | 🇨🇭 | 0.9200 |
| CNY | Chinese Yuan | ¥ | 🇨🇳 | 6.4500 |
| INR | Indian Rupee | ₹ | 🇮🇳 | 74.5000 |
| BRL | Brazilian Real | R$ | 🇧🇷 | 5.2000 |
| KRW | South Korean Won | ₩ | 🇰🇷 | 1180.0000 |
| SGD | Singapore Dollar | S$ | 🇸🇬 | 1.3500 |
| HKD | Hong Kong Dollar | HK$ | 🇭🇰 | 7.8000 |
| SEK | Swedish Krona | kr | 🇸🇪 | 8.6000 |
| NOK | Norwegian Krone | kr | 🇳🇴 | 8.5000 |

## 🔧 Configuration

### Default Settings
```typescript
{
  baseCurrency: 'USD',
  defaultCurrency: 'USD',
  enabledCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'],
  autoUpdate: true,
  apiProvider: 'exchangerate'
}
```

### Storage Keys
- `currency_settings`: Currency configuration
- `exchange_rates`: Cached exchange rates with timestamps
- `user_preferred_currency`: User's selected currency preference

## 🚨 Error Handling

### API Failures
1. **Primary API fails** → Try fallback mock API
2. **All APIs fail** → Use cached rates
3. **No cache** → Use default hardcoded rates
4. **Show user feedback** → Success/error notifications

### Invalid Currency Operations
- **Disable protection**: Can't disable last enabled currency
- **Default protection**: Can't disable default currency
- **Rate validation**: Only positive numeric rates accepted
- **Graceful degradation**: Show original currency if conversion fails

## 📈 Performance

### Caching Strategy
- **Duration**: 1 hour (3,600,000ms)
- **Storage**: localStorage with timestamps
- **Invalidation**: Automatic on expiry or manual refresh
- **Fallback**: Immediate fallback to cached/default rates

### API Optimization
- **Rate Limiting**: Respects API provider limits
- **Batch Updates**: Single API call updates all rates
- **Background Updates**: Non-blocking UI updates
- **Error Recovery**: Automatic retry with exponential backoff

## 🔐 Security Considerations

### API Keys
- **Development**: Uses free tier APIs (no keys required)
- **Production**: Implement proper API key management
- **Environment Variables**: Store sensitive keys securely
- **Rate Limiting**: Implement client-side rate limiting

### Data Validation
- **Input Sanitization**: All numeric inputs validated
- **Rate Bounds**: Reasonable min/max rate limits
- **Currency Validation**: Only supported currencies accepted
- **XSS Protection**: Proper data escaping in UI components

## 🎨 UI/UX Features

### Visual Design
- **Flag Icons**: Visual currency identification
- **Color Coding**: Status-based color schemes
- **Loading States**: Smooth loading indicators
- **Responsive**: Mobile-optimized layouts

### User Experience
- **One-Click Switching**: Easy currency selection
- **Live Updates**: Real-time conversion display
- **Keyboard Navigation**: Full accessibility support
- **Error Recovery**: Clear error messages and recovery options

## 🔄 Future Enhancements

### Planned Features
- **Historical Rates**: Chart historical exchange rate trends
- **Rate Alerts**: Notify when rates hit target values
- **Bulk Operations**: Mass currency updates for products
- **Advanced Analytics**: Currency performance metrics
- **Custom Rate Sources**: Support for additional API providers

### Integration Points
- **Product Pricing**: Auto-convert product prices
- **Order Processing**: Multi-currency order handling
- **Reporting**: Currency-aware analytics
- **User Preferences**: Personal currency settings

## 📝 Development Notes

### Adding New Currencies
1. Update `SUPPORTED_CURRENCIES` array in `currencyService.ts`
2. Add default exchange rate
3. Test conversion calculations
4. Update documentation

### API Provider Changes
1. Implement new provider in `currencyService.ts`
2. Add to provider fallback chain
3. Test error handling
4. Update configuration options

This currency system provides a robust, scalable foundation for multi-currency support across the entire Artistic Pro platform.
