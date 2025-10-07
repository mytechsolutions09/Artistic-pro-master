import { useState, useEffect } from 'react';
import { LogoService } from '../services/logoService';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/lurevi-logo.svg');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogo();
    
    // Listen for logo updates from admin panel
    const handleLogoUpdate = (event: CustomEvent) => {
      setLogoUrl(event.detail.logoUrl);
    };
    
    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener);
    };
  }, []);

  const loadLogo = async () => {
    try {
      setIsLoading(true);
      
      // First try to load from Supabase
      const settings = await LogoService.getActiveLogoSettings();
      if (settings && settings.logo_url) {
        setLogoUrl(settings.logo_url);
        return;
      }
      
      // Fallback to localStorage for backward compatibility
      const savedLogo = localStorage.getItem('customLogo');
      if (savedLogo) {
        setLogoUrl(savedLogo);
        return;
      }
      
      // Final fallback to default logo
      setLogoUrl('/lurevi-logo.svg');
    } catch (error) {
      console.error('Error loading logo:', error);
      // Fallback to localStorage or default
      const savedLogo = localStorage.getItem('customLogo');
      setLogoUrl(savedLogo || '/lurevi-logo.svg');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logoUrl,
    isLoading,
    refreshLogo: loadLogo
  };
};
