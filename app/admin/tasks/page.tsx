import dynamic from 'next/dynamic';

const Tasks = dynamic(() => import('@/src/page-components/admin/Tasks'));

export default function Page() {
  return <Tasks />;
}
