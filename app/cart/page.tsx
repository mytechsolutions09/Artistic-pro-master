import type { Metadata } from 'next';
import Cart from '@/src/page-components/Cart';

export const metadata: Metadata = {
  title: 'Cart | Lurevi',
  description: 'Your shopping cart.',
};

export default function Page() {
  return <Cart />;
}

