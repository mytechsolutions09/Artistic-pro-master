import { useEffect } from 'react';

interface OpenGraphTagsProps {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  price?: number;
  currency?: string;
  availability?: string;
  brand?: string;
  condition?: string;
}

const OpenGraphTags: React.FC<OpenGraphTagsProps> = ({
  title,
  description,
  image,
  url,
  type = 'product',
  price,
  currency = 'INR',
  availability,
  brand = 'Lurevi',
  condition = 'new'
}) => {
  useEffect(() => {
    // Clean description (remove HTML, limit length)
    const cleanDescription = description
      ?.replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200) || title;

    // Ensure absolute URLs
    const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    const absoluteImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

    // Update document title
    document.title = title;

    // Helper function to set or update meta tags
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

    // Set basic meta tags
    setMetaTag('meta[name="description"]', cleanDescription);

    // Set Open Graph tags (Facebook, Instagram, LinkedIn)
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', cleanDescription);
    setMetaTag('meta[property="og:image"]', absoluteImage);
    setMetaTag('meta[property="og:url"]', absoluteUrl);
    setMetaTag('meta[property="og:type"]', type);
    setMetaTag('meta[property="og:site_name"]', 'Lurevi');
    setMetaTag('meta[property="og:locale"]', 'en_IN');

    // Set product-specific Open Graph tags
    if (type === 'product') {
      if (price) {
        setMetaTag('meta[property="product:price:amount"]', price.toString());
        setMetaTag('meta[property="product:price:currency"]', currency);
      }
      if (availability) {
        setMetaTag('meta[property="product:availability"]', availability);
      }
      if (brand) {
        setMetaTag('meta[property="product:brand"]', brand);
      }
      if (condition) {
        setMetaTag('meta[property="product:condition"]', condition);
      }
    }

    // Set Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', title);
    setMetaTag('meta[name="twitter:description"]', cleanDescription);
    setMetaTag('meta[name="twitter:image"]', absoluteImage);

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = absoluteUrl;

  }, [title, description, image, url, type, price, currency, availability, brand, condition]);

  // This component doesn't render anything
  return null;
};

export default OpenGraphTags;

