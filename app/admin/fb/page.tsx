import dynamic from 'next/dynamic';

const FB = dynamic(() => import('@/src/page-components/admin/FB'));

export default function Page() {
  return <FB />;
}
