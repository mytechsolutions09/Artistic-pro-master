import dynamic from 'next/dynamic';

const Gifts = dynamic(() => import('@/src/page-components/admin/Gifts'));

export default function Page() {
  return <Gifts />;
}
