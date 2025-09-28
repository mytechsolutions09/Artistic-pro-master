# Localhost Development Setup

This guide explains how to configure and run the Artistic Pro application on localhost for development.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp env.template .env
   ```

2. **Update your .env file with your actual values:**
   - Replace `your-project.supabase.co` with your actual Supabase URL
   - Replace `your-anon-key` with your actual Supabase anon key
   - Update email settings if you're using email functionality

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev:localhost
   ```

## Environment Variables

### Required Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Localhost Configuration
- `VITE_DEV_SERVER_HOST` - Development server host (default: localhost)
- `VITE_DEV_SERVER_PORT` - Development server port (default: 5173)
- `VITE_APP_URL` - Application URL (default: http://localhost:5173)
- `VITE_API_URL` - API URL (default: http://localhost:5173/api)
- `VITE_ADMIN_URL` - Admin panel URL (default: http://localhost:5173/admin)

### Optional Variables
- `VITE_DEBUG_MODE` - Enable debug logging (default: true in development)
- `VITE_ENABLE_LOGGING` - Enable console logging (default: true)
- `VITE_DEFAULT_CURRENCY` - Default currency (default: INR)
- `VITE_CURRENCY_SYMBOL` - Currency symbol (default: ₹)

## Available Scripts

- `npm run dev` - Start development server with default settings
- `npm run dev:localhost` - Start development server explicitly on localhost:5173
- `npm run preview` - Preview production build
- `npm run preview:localhost` - Preview production build on localhost:4173

## Vite Configuration

The application is configured with the following localhost settings:

```typescript
server: {
  host: 'localhost',
  port: 5173,
  open: true,
  cors: true,
  proxy: {
    '/api': {
      target: 'http://localhost:5173',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## Development Features

### Environment Detection
The application automatically detects if it's running in development mode and adjusts configuration accordingly:

```typescript
// Check if running on localhost
import { isLocalhost, getLocalhostConfig } from './src/utils/envCheck';

if (isLocalhost()) {
  const config = getLocalhostConfig();
  console.log('Running on localhost:', config.url);
}
```

### API Configuration
In development mode, the API base URL automatically switches to localhost:

```typescript
// API endpoints automatically use localhost in development
const apiConfig = {
  baseURL: isDevelopment ? localhostConfig.apiUrl : supabaseConfig.url
};
```

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, you can:
1. Change the port in your `.env` file: `VITE_DEV_SERVER_PORT=3000`
2. Or kill the process using the port: `npx kill-port 5173`

### CORS Issues
The Vite configuration includes CORS settings, but if you encounter CORS issues:
1. Check that your Supabase project allows localhost origins
2. Verify that the proxy configuration is working correctly

### Environment Variables Not Loading
1. Make sure your `.env` file is in the project root
2. Restart the development server after changing environment variables
3. Check that variable names start with `VITE_`

## Production Deployment

When deploying to production:
1. Set `NODE_ENV=production`
2. Update environment variables in your hosting platform
3. The application will automatically use production URLs instead of localhost

## Support

For issues related to localhost setup:
1. Check the browser console for error messages
2. Verify all required environment variables are set
3. Ensure your Supabase project is properly configured
4. Check the network tab for failed API requests
