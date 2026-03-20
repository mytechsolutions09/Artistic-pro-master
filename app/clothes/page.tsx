import type { Metadata } from 'next';
import MenClothingPage from '@/src/page-components/MenClothingPage';

export const metadata: Metadata = {
  title: 'Clothing | Lurevi',
  description: 'Shop clothing at Lurevi.',
};

export default function Page() {
  return <MenClothingPage />;
}

