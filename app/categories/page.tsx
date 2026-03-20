import type { Metadata } from 'next';
import CategoriesPage from '@/src/page-components/CategoriesPage';

export const metadata: Metadata = {
  title: 'Art Categories | Lurevi',
  description: 'Explore all art categories at Lurevi.',
};

export default function Page() {
  return <CategoriesPage />;
}

