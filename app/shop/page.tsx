import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ShopPage = dynamic(() => import('@/src/page-components/ShopPage'));

export const metadata: Metadata = {
  title: 'Shop Premium Wall Art Prints & Modern Artwork | Lurevi',
  description: 'Explore premium wall art prints, modern paintings, and custom illustrations at Lurevi. Elevate your home decor with high-quality prints shipped across India.',
  alternates: { canonical: 'https://lurevi.in/shop' },
};

export default function Page() {
  return <ShopPage />;
}

