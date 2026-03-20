import type { Metadata } from 'next';
import Privacy from '@/src/page-components/Privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lurevi',
  description: 'Lurevi privacy policy.',
};

export default function Page() {
  return <Privacy />;
}

