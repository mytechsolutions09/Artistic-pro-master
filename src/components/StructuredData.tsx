'use client'

import { useEffect } from 'react';

const SCRIPT_ID = 'lurevi-structured-data';

const StructuredData: React.FC = () => {
  useEffect(() => {
    const payload = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://lurevi.in/#organization',
          name: 'Lurevi',
          url: 'https://lurevi.in',
          logo: 'https://lurevi.in/logo.png',
        },
        {
          '@type': 'WebSite',
          '@id': 'https://lurevi.in/#website',
          url: 'https://lurevi.in',
          name: 'Lurevi',
          publisher: { '@id': 'https://lurevi.in/#organization' },
          inLanguage: 'en',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://lurevi.in/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }, []);

  return null;
};

export default StructuredData;




