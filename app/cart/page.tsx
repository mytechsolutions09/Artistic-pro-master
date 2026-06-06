import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Cart = dynamic(() => import('@/src/page-components/Cart'));

export const metadata: Metadata = {
  title: 'Cart | Lurevi',
  description: 'Your shopping cart.',
};

export default function Page() {
  return <Cart />;
}

