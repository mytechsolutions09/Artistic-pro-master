import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/src/page-components/admin/Dashboard'));

export default function Page() {
  return <Dashboard />;
}
