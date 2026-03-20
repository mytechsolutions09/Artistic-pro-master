import type { Metadata } from 'next';
import PaymentFailed from '@/src/page-components/PaymentFailed';

export const metadata: Metadata = {
  title: 'Payment Failed | Lurevi',
  description: 'Payment could not be processed.',
};

export default function Page() {
  return <PaymentFailed />;
}

