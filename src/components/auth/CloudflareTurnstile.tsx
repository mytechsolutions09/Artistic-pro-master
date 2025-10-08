import React, { useEffect, useRef } from 'react';

interface CloudflareTurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

// Declare Turnstile on window object
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const CloudflareTurnstile: React.FC<CloudflareTurnstileProps> = ({
  onVerify,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Get Cloudflare Turnstile configuration from environment
  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;
  const enabled = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_ENABLED === 'true';
  const themeFromEnv = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_THEME || 'light';

  useEffect(() => {
    // If Turnstile is disabled or no site key, skip rendering
    if (!enabled || !siteKey) {
      console.warn('Cloudflare Turnstile is disabled or site key is missing');
      return;
    }

    // Load Turnstile script if not already loaded
    if (!document.querySelector('script[src*="challenges.cloudflare.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        renderTurnstile();
      };
    } else if (window.turnstile) {
      renderTurnstile();
    }

    return () => {
      // Cleanup: Remove widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Error removing Turnstile widget:', error);
        }
      }
    };
  }, [enabled, siteKey]);

  const renderTurnstile = () => {
    if (!containerRef.current || !window.turnstile || !siteKey) {
      return;
    }

    try {
      // Render Turnstile widget
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme || themeFromEnv,
        size: size,
        callback: (token: string) => {
          console.log('Turnstile verification successful');
          onVerify(token);
        },
        'error-callback': () => {
          console.error('Turnstile verification error');
          if (onError) onError();
        },
        'expired-callback': () => {
          console.warn('Turnstile token expired');
          if (onExpire) onExpire();
        },
      });
    } catch (error) {
      console.error('Error rendering Turnstile:', error);
      if (onError) onError();
    }
  };

  // If Turnstile is disabled, return null
  if (!enabled || !siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <div ref={containerRef} className="cf-turnstile"></div>
    </div>
  );
};

export default CloudflareTurnstile;

