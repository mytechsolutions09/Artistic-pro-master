import type { Metadata } from 'next';
import Script from 'next/script';
import ClientShell from './client-shell';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Lurevi | Luxury That Stays With You',
    template: '%s',
  },
  description:
    'Discover curated digital art, wall prints, and premium collections at Lurevi. Explore categories, browse unique pieces, and shop online.',
  metadataBase: new URL('https://lurevi.in'),
  // Do not set alternates.canonical here — it merges into every route and makes
  // non-home URLs declare the homepage as canonical ("Alternate page with proper
  // canonical tag" in Search Console). Set canonical per page or in segment layouts.
  alternates: {
    languages: {
      'en-IN': 'https://lurevi.in',
      'x-default': 'https://lurevi.in',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  other: {
    'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION_CODE || 'YOUR_BING_VERIFICATION_CODE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} bg-[#ffffff]`}>
      <head>
        {/* Meta Domain Verification */}
        <meta name="facebook-domain-verification" content="bp9lo0nxdrgb7znneqsp73r4zyf6or" />
        <meta name="p:domain_verify" content="6c59611e1883982d41b43c4e0a94dfdf" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  "@type": "Organization",
                  "@id": "https://lurevi.in/#organization",
                  name: 'Lurevi',
                  url: 'https://lurevi.in',
                  logo: 'https://lurevi.in/logo.png',
                },
                {
                  "@type": "Store",
                  "@id": "https://lurevi.in/#store",
                  name: 'Lurevi',
                  description: 'Discover curated digital art, premium wall prints, and luxury collections crafted for modern spaces at Lurevi. Free shipping across India.',
                  url: 'https://lurevi.in',
                  logo: 'https://lurevi.in/logo.png',
                  image: 'https://lurevi.in/logo.png',
                  telephone: '+91 9625788455',
                  email: 'support@lurevi.com',
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: 'WZ 14 Janakpuri',
                    addressLocality: 'New Delhi',
                    postalCode: '110058',
                    addressCountry: 'IN'
                  },
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday'
                      ],
                      opens: '09:00',
                      closes: '18:00'
                    }
                  ],
                  sameAs: [
                    'https://www.facebook.com/lurevi.in',
                    'https://www.instagram.com/lurevi.in/'
                  ]
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://lurevi.in/#website',
                  url: 'https://lurevi.in',
                  name: 'Lurevi',
                  publisher: { '@id': 'https://lurevi.in/#organization' },
                  inLanguage: 'en-IN',
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
        {/* Google Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-96M0P2Z867" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-96M0P2Z867');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-[#ffffff] text-gray-900 antialiased">
        <ClientShell>{children}</ClientShell>
        {/* Defer Meta Pixel until after window.onload */}
        <Script id="fb-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.defer=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1905415970060955');fbq('track','PageView');`}
        </Script>
      </body>
    </html>
  );
}
