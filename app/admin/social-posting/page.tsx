import dynamic from 'next/dynamic';

const SocialPosting = dynamic(() => import('@/src/page-components/admin/SocialPosting'));

export default function Page() {
  return <SocialPosting />;
}
