import type { Metadata } from 'next';
import Terms from '@/src/page-components/Terms';

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

