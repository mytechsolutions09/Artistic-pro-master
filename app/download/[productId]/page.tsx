import type { Metadata } from 'next';
import DownloadPage from '@/src/page-components/DownloadPage';

export const metadata: Metadata = {
  title: 'Download | Lurevi',
  description: 'Download your purchased artwork.',
};

export default function Page() {
  return <DownloadPage />;
}
