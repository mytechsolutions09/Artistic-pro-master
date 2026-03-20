'use client';

import LoginFormClient from '@/src/components/auth/LoginForm';

export default function Page() {
  return <LoginFormClient onLoginSuccess={() => { window.location.href = '/'; }} />;
}
