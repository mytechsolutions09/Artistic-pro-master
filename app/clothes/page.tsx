import type { Metadata } from 'next';
import MenClothingPage from '@/src/page-components/MenClothingPage';

export const metadata: Metadata = {
  title: 'Clothing | Lurevi',
  description: 'Shop clothing at Lurevi.',
  alternates: { canonical: 'https://lurevi.in/clothes' },
};

export default function Page() {
  return <MenClothingPage />;
}

