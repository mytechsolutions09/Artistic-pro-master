import type { Metadata } from 'next';
import AboutUs from '@/src/page-components/AboutUs';

export const metadata: Metadata = {
  title: 'About Us | Lurevi',
  description: 'Learn about Lurevi.',
  alternates: { canonical: 'https://lurevi.in/about-us' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <AboutUs />;
}

