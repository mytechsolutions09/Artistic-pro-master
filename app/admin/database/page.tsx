import dynamic from 'next/dynamic';

const DatabaseManagement = dynamic(() => import('@/src/page-components/admin/Database'));

export default function Page() {
  return <DatabaseManagement />;
}
