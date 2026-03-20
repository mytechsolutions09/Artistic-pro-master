import type { Metadata } from 'next';
import Returns from '@/src/page-components/Returns';

export const metadata: Metadata = {
  title: 'Returns and Refunds | Lurevi',
  description: 'Lurevi returns and refunds policy.',
};

export default function Page() {
  return <Returns />;
}

