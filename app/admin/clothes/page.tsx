import dynamic from 'next/dynamic';

const Clothes = dynamic(() => import('@/src/page-components/admin/Clothes'));

export default function Page() {
  return <Clothes />;
}
