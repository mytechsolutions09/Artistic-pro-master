import dynamic from 'next/dynamic';

const Settings = dynamic(() => import('@/src/page-components/admin/Settings'));

export default function Page() {
  return <Settings />;
}
