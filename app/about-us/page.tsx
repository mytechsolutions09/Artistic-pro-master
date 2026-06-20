import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const AboutUs = dynamic(() => import('@/src/page-components/AboutUs'));

export const metadata: Metadata = {
  title: 'About Us - Our Story & Premium Art Prints | Lurevi',
  description: 'Discover the story of Lurevi, your trusted destination for premium digital art prints, museum-grade framing, and modern wall decor collections in India.',
  alternates: { canonical: 'https://lurevi.in/about-us' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <AboutUs />;
}

