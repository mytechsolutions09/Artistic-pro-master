import type { Metadata } from 'next';
import ResetPasswordForm from '@/src/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | Lurevi',
  description: 'Set a new password.',
};

export default function Page() {
  return <ResetPasswordForm />;
}
