import type { Metadata } from 'next';
import AboutUs from '@/src/page-components/AboutUs';

export const metadata: Metadata = {
  title: 'About Us | Lurevi',
  description: 'Learn about Lurevi.',
  alternates: { canonical: 'https://lurevi.in/about-us' },
};

export default function Page() {
  return <AboutUs />;
}

