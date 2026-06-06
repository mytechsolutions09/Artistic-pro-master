import dynamic from 'next/dynamic';

const CommissionedArt = dynamic(() => import('@/src/page-components/admin/CommissionedArt'));

export default function Page() {
  return <CommissionedArt />;
}
