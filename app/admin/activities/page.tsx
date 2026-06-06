import dynamic from 'next/dynamic';

const Activities = dynamic(() => import('@/src/page-components/admin/Activities'));

export default function Page() {
  return <Activities />;
}
