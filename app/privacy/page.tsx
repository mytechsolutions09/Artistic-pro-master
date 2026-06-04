import type { Metadata } from 'next';
import Privacy from '@/src/page-components/Privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lurevi',
  description: 'Lurevi privacy policy.',
  alternates: { canonical: 'https://lurevi.in/privacy' },
};

// Statically generated (ISR) for fast SEO.
export const revalidate = 86400;

export default function Page() {
  return <Privacy />;
}

