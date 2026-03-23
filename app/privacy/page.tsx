import type { Metadata } from 'next';
import Privacy from '@/src/page-components/Privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lurevi',
  description: 'Lurevi privacy policy.',
  alternates: { canonical: 'https://lurevi.in/privacy' },
};

export default function Page() {
  return <Privacy />;
}

