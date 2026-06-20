import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Returns = dynamic(() => import('@/src/page-components/Returns'));

export const metadata: Metadata = {
  title: 'Returns and Refunds Policy - Order Returns Help | Lurevi',
  description: 'Read the Lurevi returns and refunds policy. Learn about our 7-day return guarantee, replacements, cancellation timelines, and refund process details.',
  alternates: { canonical: 'https://lurevi.in/returns-and-refunds' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <Returns />;
}

