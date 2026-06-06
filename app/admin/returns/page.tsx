import dynamic from 'next/dynamic';

const AdminReturns = dynamic(() => import('@/src/page-components/admin/Returns'));

export default function Page() {
  return <AdminReturns />;
}
