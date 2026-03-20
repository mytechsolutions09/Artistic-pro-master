import type { Metadata } from 'next';
import AboutUs from '@/src/page-components/AboutUs';

export const metadata: Metadata = {
  title: 'About Us | Lurevi',
  description: 'Learn about Lurevi.',
};

export default function Page() {
  return <AboutUs />;
}

