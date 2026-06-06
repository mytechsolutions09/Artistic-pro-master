import dynamic from 'next/dynamic';

const EmailManagement = dynamic(() => import('@/src/page-components/admin/EmailManagement'));

export default function Page() {
  return <EmailManagement />;
}
