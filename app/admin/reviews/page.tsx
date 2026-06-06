import dynamic from 'next/dynamic';

const Reviews = dynamic(() => import('@/src/page-components/admin/Reviews'));

export default function Page() {
  return <Reviews />;
}
