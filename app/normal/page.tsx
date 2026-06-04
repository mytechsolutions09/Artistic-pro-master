import type { Metadata } from 'next';
import NormalItemsPage from '@/src/page-components/NormalItemsPage';

export const metadata: Metadata = {
  title: 'Shop | Lurevi',
  description: 'Browse our collection.',
};

export default function Page() {
  return <NormalItemsPage />;
}

