import dynamic from 'next/dynamic';

const NewsletterManagement = dynamic(() => import('@/src/page-components/admin/NewsletterManagement'));

export default function Page() {
  return <NewsletterManagement />;
}
