import type { Metadata } from 'next';
import Returns from '@/src/page-components/Returns';

export const metadata: Metadata = {
  title: 'Returns and Refunds | Lurevi',
  description: 'Lurevi returns and refunds policy.',
  alternates: { canonical: 'https://lurevi.in/returns-and-refunds' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <Returns />;
}

