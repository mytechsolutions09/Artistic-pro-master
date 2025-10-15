import { useState, useEffect } from 'react';

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/logo.png');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set logo to local file from public folder
    setLogoUrl('/logo.png');
    
    // Listen for logo updates from admin panel (if needed in future)
    const handleLogoUpdate = (event: CustomEvent) => {
      setLogoUrl(event.detail.logoUrl);
    };
    
    window.addEventListener('logoUpdated', handleLogoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate as EventListener);
    };
  }, []);

  const loadLogo = async () => {
    // No async loading needed - using local file
    setLogoUrl('/logo.png');
  };

  return {
    logoUrl,
    isLoading,
    refreshLogo: loadLogo
  };
};
