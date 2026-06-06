import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const UserDashboard = dynamic(() => import('@/src/page-components/UserDashboard'));

export const metadata: Metadata = {
  title: 'Dashboard | Lurevi',
  description: 'Your account dashboard.',
};

export default function Page() {
  return <UserDashboard />;
}

