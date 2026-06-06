import dynamic from 'next/dynamic';

const Marketing = dynamic(() => import('@/src/page-components/admin/Marketing'));

export default function Page() {
  return <Marketing />;
}
