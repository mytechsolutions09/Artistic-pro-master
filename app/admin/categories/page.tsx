import dynamic from 'next/dynamic';

const Categories = dynamic(() => import('@/src/page-components/admin/Categories'));

export default function Page() {
  return <Categories />;
}
