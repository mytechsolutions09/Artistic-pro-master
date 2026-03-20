import type { Metadata } from 'next';
import PaymentSuccess from '@/src/page-components/PaymentSuccess';

export const metadata: Metadata = {
  title: 'Payment Successful | Lurevi',
  description: 'Payment confirmed.',
};

export default function Page() {
  return <PaymentSuccess />;
}

