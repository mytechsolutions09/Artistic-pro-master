import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const MenClothingPage = dynamic(() => import('@/src/page-components/MenClothingPage'));

export const metadata: Metadata = {
  title: 'Clothing | Lurevi',
  description: 'Shop clothing at Lurevi.',
  alternates: {
    canonical: 'https://lurevi.in/clothes',
    languages: {
      'en-IN': 'https://lurevi.in/clothes',
      'x-default': 'https://lurevi.in/clothes',
    },
  },
};

export default function Page() {
  return <MenClothingPage />;
}

