import type { Metadata } from 'next';
import BrowsePage from '@/src/page-components/BrowsePage';

export const metadata: Metadata = {
  title: 'Browse Art | Lurevi',
  description: 'Browse all digital art and prints at Lurevi.',
};

export default function Page() {
  return <BrowsePage />;
}

