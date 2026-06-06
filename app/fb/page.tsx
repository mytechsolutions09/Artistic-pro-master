import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const FBPage = dynamic(() => import('@/src/page-components/FBPage'));

export const metadata: Metadata = {
  title: 'Food & Beverage | Lurevi',
  description: 'Explore our Food and Beverage collection.',
};

export default function Page() {
  return <FBPage />;
}

