import dynamic from 'next/dynamic';

const Products = dynamic(() => import('@/src/page-components/admin/Products'));

export default function Page() {
  return <Products />;
}
