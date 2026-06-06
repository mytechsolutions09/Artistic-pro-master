import dynamic from 'next/dynamic';

const Normal = dynamic(() => import('@/src/page-components/admin/Normal'));

export default function Page() {
  return <Normal />;
}
