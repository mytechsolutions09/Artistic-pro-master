import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ShopPage = dynamic(() => import('@/src/page-components/ShopPage'));

export const metadata: Metadata = {
  title: 'Shop | Lurevi',
  description: 'Shop premium art and prints at Lurevi.',
  alternates: { canonical: 'https://lurevi.in/shop' },
};

export default function Page() {
  return <ShopPage />;
}

