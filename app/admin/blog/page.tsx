import dynamic from 'next/dynamic';

const BlogAdmin = dynamic(() => import('@/src/page-components/admin/Blog'));

export default function Page() {
  return <BlogAdmin />;
}
