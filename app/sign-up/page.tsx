import type { Metadata } from 'next';
import SignUpForm from '@/src/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | Lurevi',
  description: 'Create your Lurevi account.',
};

export default function Page() {
  return <SignUpForm />;
}
