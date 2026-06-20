import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const FAQ = dynamic(() => import('@/src/page-components/FAQ'));

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) & Customer Help | Lurevi',
  description: 'Find answers to frequently asked questions about Lurevi orders, shipping times, return policies, payment methods, and custom artwork queries here.',
  alternates: { canonical: 'https://lurevi.in/faq' },
};

// Statically generated (ISR) for fast SEO and minimal server work.
export const revalidate = 86400;

export default function Page() {
  return <FAQ />;
}

