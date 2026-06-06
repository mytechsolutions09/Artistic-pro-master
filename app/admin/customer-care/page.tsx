import dynamic from 'next/dynamic';

const CustomerCare = dynamic(() => import('@/src/page-components/admin/CustomerCare'));

export default function Page() {
  return <CustomerCare />;
}
