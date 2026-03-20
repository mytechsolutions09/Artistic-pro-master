import type { Metadata } from 'next';
import AdminShell from './admin-shell';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Lurevi',
  description: 'Secure Lurevi admin dashboard for catalog, orders, users, and marketing management.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
