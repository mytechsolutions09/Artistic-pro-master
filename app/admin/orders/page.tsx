import dynamic from 'next/dynamic';

const Orders = dynamic(() => import('@/src/page-components/admin/Orders'));

export default function Page() {
  return <Orders />;
}
