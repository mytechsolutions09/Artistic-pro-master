import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const DownloadPage = dynamic(() => import('@/src/page-components/DownloadPage'));

export const metadata: Metadata = {
  title: 'Download | Lurevi',
  description: 'Download your purchased artwork.',
};

export default function Page() {
  return <DownloadPage />;
}
