import type { Metadata } from 'next';
import HelpCenter from '@/src/page-components/HelpCenter';

export const metadata: Metadata = {
  title: 'Help Center | Lurevi',
  description: 'Get help with your Lurevi orders and account.',
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <HelpCenter />;
}

