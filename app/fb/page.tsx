import type { Metadata } from 'next';
import FBPage from '@/src/page-components/FBPage';

export const metadata: Metadata = {
  title: 'Food & Beverage | Lurevi',
  description: 'Explore our Food and Beverage collection.',
};

export default function Page() {
  return <FBPage />;
}

