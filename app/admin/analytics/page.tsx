import dynamic from 'next/dynamic';

const Analytics = dynamic(() => import('@/src/page-components/admin/Analytics'));

export default function Page() {
  return <Analytics />;
}
