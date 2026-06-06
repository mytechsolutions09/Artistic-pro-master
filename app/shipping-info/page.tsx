import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ShippingInfo = dynamic(() => import('@/src/page-components/ShippingInfo'));

export const metadata: Metadata = {
  title: 'Shipping Info | Lurevi',
  description: 'Lurevi shipping details.',
  alternates: { canonical: 'https://lurevi.in/shipping-info' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <ShippingInfo />;
}

