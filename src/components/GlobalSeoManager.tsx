'use client'

import { useEffect, useState } from 'react';
import { useLocation } from '@/src/compat/router';
import { supabase } from '../services/supabaseService';

const FIXED_MARKETING_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

interface GlobalSeoSettings {
  page_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  robots: string | null;
}

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

const getCanonicalUrl = (pathname: string) => {
  const normalizedPath = pathname.length > 1
    ? pathname.replace(/\/+$/, '')
    : pathname;
  return `${window.location.origin}${normalizedPath}`;
};

const GlobalSeoManager: React.FC = () => {
  const location = useLocation();
  const [seoSettings, setSeoSettings] = useState<GlobalSeoSettings | null>(null);

  useEffect(() => {
    const loadSeoSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('marketing_settings')
          .select('page_title, meta_description, meta_keywords, og_image, robots')
          .eq('id', FIXED_MARKETING_ID)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load SEO settings:', error);
          return;
        }

        if (data) {
          setSeoSettings(data as GlobalSeoSettings);
        }
      } catch (err) {
        console.error('Error loading global SEO settings:', err);
      }
    };

    loadSeoSettings();
  }, []);

  useEffect(() => {
    if (!seoSettings) return;

    const pageTitle = seoSettings.page_title?.trim();
    const description = seoSettings.meta_description?.trim();
    const keywords = seoSettings.meta_keywords?.trim();
    const ogImage = seoSettings.og_image?.trim();
    const robots = seoSettings.robots?.trim();
    const canonicalUrl = getCanonicalUrl(location.pathname);
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

    if (robots) {
      setMetaTag('meta[name="robots"]', robots);
    }

    const imageUrl = ogImage || defaultImage;
    setMetaTag('meta[property="og:image"]', imageUrl);
    setMetaTag('meta[name="twitter:image"]', imageUrl);
    setMetaTag('meta[property="og:url"]', canonicalUrl);
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [location.pathname, seoSettings]);

  return null;
};

export default GlobalSeoManager;




