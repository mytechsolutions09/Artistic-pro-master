import type { Metadata } from 'next';
import ForgotPasswordForm from '@/src/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | Lurevi',
  description: 'Reset your password.',
};

export default function Page() {
  return <ForgotPasswordForm />;
}
