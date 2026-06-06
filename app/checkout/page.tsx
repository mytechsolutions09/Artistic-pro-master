import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Checkout = dynamic(() => import('@/src/page-components/Checkout'));

export const metadata: Metadata = {
  title: 'Checkout | Lurevi',
  description: 'Complete your purchase.',
};

export default function Page() {
  return <Checkout />;
}

