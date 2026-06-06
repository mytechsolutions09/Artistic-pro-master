import dynamic from 'next/dynamic';

const Shipping = dynamic(() => import('@/src/page-components/admin/Shipping'));

export default function Page() {
  return <Shipping />;
}
