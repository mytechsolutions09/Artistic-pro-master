import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Privacy = dynamic(() => import('@/src/page-components/Privacy'));

export const metadata: Metadata = {
  title: 'Privacy Policy - Personal Data Security | Lurevi',
  description: 'Read the Lurevi privacy policy. Learn how we securely collect, use, store, and protect your personal information, cookies, and transaction data.',
  alternates: { canonical: 'https://lurevi.in/privacy' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <Privacy />;
}

