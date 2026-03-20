import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

// Load the entire interactive shell (providers + header + footer) only on the
// client side. This prevents any browser-API calls (localStorage, window, etc.)
// from running during server-side rendering / static generation.
// The SEO metadata and page content are still generated server-side.
const ClientShell = dynamic(() => import('./client-shell'), { ssr: false });

export const metadata: Metadata = {
  title: {
    default: 'Lurevi | Luxury That Stays With You',
    template: '%s | Lurevi',
  },
  description:
    'Discover curated digital art, wall prints, and premium collections at Lurevi. Explore categories, browse unique pieces, and shop online.',
  metadataBase: new URL('https://lurevi.in'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Lurevi',
    title: 'Lurevi | Luxury That Stays With You',
    description:
      'Discover curated digital art, wall prints, and premium collections at Lurevi.',
    url: 'https://lurevi.in',
    images: [{ url: '/logo.png', width: 600, height: 200, alt: 'Lurevi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lurevi | Luxury That Stays With You',
    description:
      'Discover curated digital art, wall prints, and premium collections at Lurevi.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Meta Domain Verification */}
        <meta name="facebook-domain-verification" content="bp9lo0nxdrgb7znneqsp73r4zyf6or" />
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Dancing+Script:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            }),
          }}
        />
        {/* Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1905415970060955');fbq('track','PageView');`,
          }}
        />
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1905415970060955&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
