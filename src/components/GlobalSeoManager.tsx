import { useEffect } from 'react';
import { supabase } from '../services/supabaseService';

const FIXED_MARKETING_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const setMetaTag = (selector: string, content: string) => {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    if (selector.includes('property=')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) element.setAttribute('property', property);
    } else if (selector.includes('name=')) {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const GlobalSeoManager: React.FC = () => {
  useEffect(() => {
    const applySeo = async () => {
      try {
        const { data, error } = await supabase
          .from('marketing_settings')
          .select('page_title, meta_description, meta_keywords, og_image')
          .eq('id', FIXED_MARKETING_ID)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load SEO settings:', error);
          return;
        }

        if (!data) return;

        const pageTitle = data.page_title?.trim();
        const description = data.meta_description?.trim();
        const keywords = data.meta_keywords?.trim();
        const ogImage = data.og_image?.trim();
        const currentUrl = window.location.href;
        const defaultImage = `${window.location.origin}/logo.png`;

        if (pageTitle) {
          document.title = pageTitle;
          setMetaTag('meta[property="og:title"]', pageTitle);
          setMetaTag('meta[name="twitter:title"]', pageTitle);
        }

        if (description) {
          setMetaTag('meta[name="description"]', description);
          setMetaTag('meta[property="og:description"]', description);
          setMetaTag('meta[name="twitter:description"]', description);
        }

        if (keywords) {
          setMetaTag('meta[name="keywords"]', keywords);
        }

        const imageUrl = ogImage || defaultImage;
        setMetaTag('meta[property="og:image"]', imageUrl);
        setMetaTag('meta[name="twitter:image"]', imageUrl);
        setMetaTag('meta[property="og:url"]', currentUrl);
        setMetaTag('meta[name="twitter:card"]', 'summary_large_image');

        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = currentUrl;
      } catch (err) {
        console.error('Error applying global SEO settings:', err);
      }
    };

    applySeo();
  }, []);

  return null;
};

export default GlobalSeoManager;
