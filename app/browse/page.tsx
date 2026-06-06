import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const BrowsePage = dynamic(() => import('@/src/page-components/BrowsePage'));

export const metadata: Metadata = {
  title: 'Browse Art | Lurevi',
  description: 'Browse all digital art and prints at Lurevi.',
  alternates: { canonical: 'https://lurevi.in/browse' },
};

export default function Page() {
  return <BrowsePage />;
}

