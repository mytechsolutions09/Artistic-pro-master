import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const FAQ = dynamic(() => import('@/src/page-components/FAQ'));

export const metadata: Metadata = {
  title: 'FAQ | Lurevi',
  description: 'Frequently asked questions about Lurevi.',
  alternates: { canonical: 'https://lurevi.in/faq' },
};

// Statically generated (ISR) for fast SEO and minimal server work.
export const revalidate = 86400;

export default function Page() {
  return <FAQ />;
}

