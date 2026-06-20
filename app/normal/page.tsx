import type { Metadata } from 'next';
import NormalItemsPage from '@/src/page-components/NormalItemsPage';

export const metadata: Metadata = {
  title: 'Browse Premium Art Prints & Wall Decor | Lurevi',
  description: 'Browse our complete catalog of premium normal prints and artistic wall decor. High-quality prints designed to bring character and style to any room in your home.',
};

export default function Page() {
  return <NormalItemsPage />;
}

