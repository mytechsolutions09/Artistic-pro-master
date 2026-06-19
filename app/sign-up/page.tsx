import type { Metadata } from 'next';
import SignUpForm from '@/src/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | Lurevi',
  description: 'Create your Lurevi account today to track orders, save your favorite digital art prints, manage shipping addresses, and receive exclusive offers and updates.',
};

export default function Page() {
  return <SignUpForm />;
}
