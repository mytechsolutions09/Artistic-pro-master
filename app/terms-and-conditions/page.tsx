import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Terms = dynamic(() => import('@/src/page-components/Terms'));

export const metadata: Metadata = {
  title: 'Terms and Conditions | Lurevi',
  description: 'Lurevi terms and conditions.',
  alternates: { canonical: 'https://lurevi.in/terms-and-conditions' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <Terms />;
}

