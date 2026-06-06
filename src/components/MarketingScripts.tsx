'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseService';
import MetaPixelService from '../services/metaPixelService';
import { useLocation } from '@/src/compat/router';

const FIXED_MARKETING_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function MarketingScripts() {
  const location = useLocation();
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadMarketingSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('marketing_settings')
          .select('meta_pixel_id, meta_pixel_enabled, google_analytics_id, google_analytics_enabled, google_tag_manager_id, google_tag_manager_enabled')
          .eq('id', FIXED_MARKETING_ID)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load marketing settings:', error);
          return;
        }

        if (data) {
          // 1. Setup Meta Pixel
          if (data.meta_pixel_enabled && data.meta_pixel_id) {
            MetaPixelService.setPixelId(data.meta_pixel_id);
            // We do not inject the script again if it's in index.html, but if we want dynamic, we should inject it here.
            // Since it's already in index.html with a hardcoded ID, it's better to update the ID.
            // Actually, we can just call fbq('init', data.meta_pixel_id)
            if (typeof window !== 'undefined' && window.fbq) {
              window.fbq('init', data.meta_pixel_id);
            }
          }

          // 2. Setup Google Analytics (GA4)
          if (data.google_analytics_enabled && data.google_analytics_id && !document.getElementById('ga-script')) {
            const script = document.createElement('script');
            script.id = 'ga-script';
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${data.google_analytics_id}`;
            document.head.appendChild(script);

            const inlineScript = document.createElement('script');
            inlineScript.id = 'ga-inline-script';
            inlineScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${data.google_analytics_id}');
            `;
            document.head.appendChild(inlineScript);
          }

          // 3. Setup Google Tag Manager (GTM)
          if (data.google_tag_manager_enabled && data.google_tag_manager_id && !document.getElementById('gtm-script')) {
            const script = document.createElement('script');
            script.id = 'gtm-script';
            script.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${data.google_tag_manager_id}');
            `;
            document.head.appendChild(script);

            // GTM noscript iframe
            const noscript = document.createElement('noscript');
            noscript.id = 'gtm-noscript';
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.googletagmanager.com/ns.html?id=${data.google_tag_manager_id}`;
            iframe.height = '0';
            iframe.width = '0';
            iframe.style.display = 'none';
            iframe.style.visibility = 'hidden';
            noscript.appendChild(iframe);
            document.body.insertBefore(noscript, document.body.firstChild);
          }
        }
        setSettingsLoaded(true);
      } catch (err) {
        console.error('Error loading marketing settings for scripts:', err);
      }
    };

    loadMarketingSettings();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (settingsLoaded) {
      // Track Meta Pixel pageview
      MetaPixelService.trackPageView();

      // Track GA4 pageview
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: location.pathname + location.search
        });
      }
    }
  }, [location, settingsLoaded]);

  return null;
}
