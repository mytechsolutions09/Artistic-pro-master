import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const HelpCenter = dynamic(() => import('@/src/page-components/HelpCenter'));

export const metadata: Metadata = {
  title: 'Help Center & Customer Support | Lurevi',
  description: 'Get customer support and help with your Lurevi orders, shipping queries, custom digital art prints, payment methods, and account settings.',
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <HelpCenter />;
}

