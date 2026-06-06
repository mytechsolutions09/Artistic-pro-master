import dynamic from 'next/dynamic';

const HomepageManagement = dynamic(() => import('@/src/page-components/admin/HomepageManagement'));

export default function Page() {
  return <HomepageManagement />;
}
