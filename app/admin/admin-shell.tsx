'use client';

import AdminProtectedRoute from '@/src/components/auth/AdminProtectedRoute';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return <AdminProtectedRoute>{children}</AdminProtectedRoute>;
}
