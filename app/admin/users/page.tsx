import dynamic from 'next/dynamic';

const Users = dynamic(() => import('@/src/page-components/admin/Users'));

export default function Page() {
  return <Users />;
}
