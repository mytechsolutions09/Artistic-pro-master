import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Terms = dynamic(() => import('@/src/page-components/Terms'));

export const metadata: Metadata = {
  title: 'Terms and Conditions & User Agreement | Lurevi',
  description: 'Read the Lurevi terms and conditions. Learn about our user agreement, site usage rules, service restrictions, intellectual property, and liability terms.',
  alternates: { canonical: 'https://lurevi.in/terms-and-conditions' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <Terms />;
}

