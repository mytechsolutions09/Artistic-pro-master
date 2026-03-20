import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '@/src/compat/router';
import { X } from 'lucide-react';
import { supabase } from '../services/supabaseService';

const PromoBar: React.FC = () => {
  const location = useLocation();
  const [config, setConfig] = useState<any>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const fetchPromoBar = async () => {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('promotional_bar')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load promotional bar:', error);
        return;
      }

      if (data?.promotional_bar) setConfig(data.promotional_bar);
    };

    fetchPromoBar();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Hide on admin pages or if not configured / not enabled / dismissed
  if (
    location.pathname.startsWith('/admin') ||
    !config?.enabled ||
    dismissed
  ) return null;

  return (
    <div
      className="relative w-full flex items-center justify-center px-10 py-2.5 text-xs sm:text-sm font-medium font-sans z-50"
      style={{ backgroundColor: config.bgColor || '#111827', color: config.textColor || '#ffffff' }}
    >
      <span>{config.text}</span>

      {config.linkText && config.link && (
        <Link
          to={config.link}
          className="ml-2 underline underline-offset-2 font-semibold opacity-90 hover:opacity-100 transition-opacity"
          style={{ color: config.textColor || '#ffffff' }}
        >
          {config.linkText} →
        </Link>
      )}

      {config.dismissible !== false && (
        <button
          onClick={handleDismiss}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity p-1 rounded"
          aria-label="Dismiss"
          style={{ color: config.textColor || '#ffffff' }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default PromoBar;



