import type { Metadata } from 'next';
import FAQ from '@/src/page-components/FAQ';

export const metadata: Metadata = {
  title: 'FAQ | Lurevi',
  description: 'Frequently asked questions about Lurevi.',
};

export default function Page() {
  return <FAQ />;
}

