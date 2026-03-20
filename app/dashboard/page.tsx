import type { Metadata } from 'next';
import UserDashboard from '@/src/page-components/UserDashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Lurevi',
  description: 'Your account dashboard.',
};

export default function Page() {
  return <UserDashboard />;
}

