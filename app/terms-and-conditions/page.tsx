import type { Metadata } from 'next';
import Terms from '@/src/page-components/Terms';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Lurevi',
  description: 'Lurevi terms and conditions.',
};

export default function Page() {
  return <Terms />;
}

